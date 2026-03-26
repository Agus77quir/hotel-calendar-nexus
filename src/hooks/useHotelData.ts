
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Guest, Reservation, ReservationGroup, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeUpdates } from './useRealtimeUpdates';

type UseHotelDataOptions = {
  guests?: boolean;
  rooms?: boolean;
  reservations?: boolean;
  reservationGroups?: boolean;
};

const defaultOptions: Required<UseHotelDataOptions> = {
  guests: true,
  rooms: true,
  reservations: true,
  reservationGroups: true,
};

const queryConfig = {
  staleTime: 30000,
  gcTime: 300000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};

export const useHotelData = (options?: UseHotelDataOptions) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryOptions = { ...defaultOptions, ...options };

  // Activar tiempo real
  useRealtimeUpdates();

  // Consultas optimizadas
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    enabled: queryOptions.guests,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const processedData = (data || []).map(guest => ({
        ...guest,
        is_associated: Boolean(guest.is_associated),
        discount_percentage: Number(guest.discount_percentage) || 0
      })) as Guest[];

      return processedData;
    },
    ...queryConfig,
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    enabled: queryOptions.rooms,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) throw error;
      
      const processedData = (data || []).map(room => ({
        ...room,
        type: room.type as Room['type'],
        status: room.status as Room['status'],
        price: Number(room.price),
        capacity: Number(room.capacity),
        amenities: room.amenities || []
      })) as Room[];

      return processedData;
    },
    ...queryConfig,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    enabled: queryOptions.reservations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const processedData = (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as Reservation['status'],
        guests_count: Number(reservation.guests_count),
        total_amount: Number(reservation.total_amount)
      })) as Reservation[];

      return processedData;
    },
    ...queryConfig,
  });

  const { data: reservationGroups = [], isLoading: reservationGroupsLoading } = useQuery({
    queryKey: ['reservation_groups'],
    enabled: queryOptions.reservationGroups,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('reservation_groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const processedData = (data || []).map((group: any) => ({
        ...group,
        status: group.status as ReservationGroup['status'],
        rooms_count: Number(group.rooms_count),
        total_amount: Number(group.total_amount)
      })) as ReservationGroup[];

      return processedData;
    },
    ...queryConfig,
  });

  const stats: HotelStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    let occupiedRooms = 0;
    let availableRooms = 0;
    let maintenanceRooms = 0;

    for (const room of rooms) {
      if (room.status === 'occupied') occupiedRooms += 1;
      else if (room.status === 'available') availableRooms += 1;
      else if (room.status === 'maintenance') maintenanceRooms += 1;
    }

    let todayCheckIns = 0;
    let todayCheckOuts = 0;
    let revenue = 0;

    for (const reservation of reservations) {
      if (reservation.check_in === today && reservation.status === 'confirmed') todayCheckIns += 1;
      if (reservation.check_out === today && reservation.status === 'checked-in') todayCheckOuts += 1;
      revenue += Number(reservation.total_amount || 0);
    }

    return {
      totalRooms: rooms.length,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      totalReservations: reservations.length,
      todayCheckIns,
      todayCheckOuts,
      revenue,
    };
  }, [rooms, reservations]);

  // Mutación optimizada para check-in/check-out
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      // Obtener reserva actual
      const { data: currentReservation, error: fetchError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Actualizar reserva
      const { data: updatedReservation, error } = await supabase
        .from('reservations')
        .update({ 
          ...data, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Actualizar estado de habitación
      if (data.status && currentReservation?.room_id) {
        let roomStatus: Room['status'] = 'available';
        
        if (data.status === 'checked-in') {
          roomStatus = 'occupied';
        } else if (data.status === 'checked-out' || data.status === 'cancelled') {
          roomStatus = 'available';
        }

        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: roomStatus })
          .eq('id', currentReservation.room_id);

        if (roomError) throw roomError;
      }
      
      return updatedReservation;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    }
  });

  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
      // Transform the guest data to ensure compatibility with database schema
      const dbGuestData = {
        first_name: guestData.first_name,
        last_name: guestData.last_name,
        email: guestData.email || null, // Use null instead of undefined for database
        phone: guestData.phone,
        document: guestData.document,
        nationality: guestData.nationality || null, // Use null instead of undefined for database
        is_associated: guestData.is_associated || false,
        discount_percentage: guestData.discount_percentage || 0
      };

      // Intentar crear el huésped
      const { data, error } = await supabase
        .from('guests')
        .insert([dbGuestData])
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      return data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, ...guestData }: { id: string } & Partial<Omit<Guest, 'id'>>) => {
      const { data, error } = await supabase
        .from('guests')
        .update(guestData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const addRoomMutation = useMutation({
    mutationFn: async (roomData: Omit<Room, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Habitación creada",
        description: "La habitación se ha creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la habitación",
        variant: "destructive",
      });
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, updateGroupPrice = true, ...roomData }: { id: string; updateGroupPrice?: boolean } & Partial<Omit<Room, 'id'>>) => {
      // If price is being updated and updateGroupPrice is true, update all rooms of the same type
      if (roomData.price !== undefined && updateGroupPrice) {
        // First get the current room to know its type
        const { data: currentRoom, error: fetchError } = await supabase
          .from('rooms')
          .select('type')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Update all rooms of the same type with the new price
        const { error: bulkUpdateError } = await supabase
          .from('rooms')
          .update({ price: roomData.price })
          .eq('type', currentRoom.type);

        if (bulkUpdateError) throw bulkUpdateError;
      }

      // Then update the specific room with all the provided data
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      if (variables.updateGroupPrice && variables.price !== undefined) {
        toast({
          title: "Habitación actualizada",
          description: "Los precios se han sincronizado para todas las habitaciones del mismo tipo",
        });
      } else {
        toast({
          title: "Habitación actualizada",
          description: "La habitación se ha actualizado correctamente",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la habitación",
        variant: "destructive",
      });
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const addReservationMutation = useMutation({
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Mutación para crear grupo de reservas múltiples
  const addReservationGroupMutation = useMutation({
    mutationFn: async ({
      guestId,
      checkIn,
      checkOut,
      roomsData,
      specialRequests
    }: {
      guestId: string;
      checkIn: string;
      checkOut: string;
      roomsData: Array<{ roomId: string; guestsCount: number; totalAmount: number }>;
      specialRequests?: string;
    }) => {
      // 1. Calcular total del grupo
      const totalAmount = roomsData.reduce((sum, room) => sum + room.totalAmount, 0);

      // 2. Crear el grupo de reservas
        const roundedTotalAmount = Math.round(totalAmount * 100) / 100;

        const { data: group, error: groupError } = await (supabase as any)
          .from('reservation_groups')
          .insert([
            {
              guest_id: guestId,
              check_in: checkIn,
              check_out: checkOut,
              rooms_count: roomsData.length,
              total_amount: roundedTotalAmount,
              status: 'confirmed',
              special_requests: specialRequests || ''
            }
          ])
          .select()
          .single();

        if (groupError) {
          throw groupError;
        }

        // 3. Crear las reservas individuales vinculadas al grupo
        const reservationsData = roomsData.map((room) => ({
          guest_id: guestId,
          room_id: room.roomId,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: Math.max(1, Number(room.guestsCount) || 1),
          total_amount: Math.round(Number(room.totalAmount) * 100) / 100,
          status: 'confirmed' as const,
          special_requests: specialRequests || '',
          group_id: group.id
        }));

        const { data: reservations, error: reservationsError } = await supabase
          .from('reservations')
          .insert(reservationsData)
          .select();

        if (reservationsError) {
          // Eliminar el grupo si falla la creación de reservas
          await (supabase as any)
            .from('reservation_groups')
            .delete()
            .eq('id', group.id);
          
          throw reservationsError;
        }

        return {
          group,
          reservations,
          created: reservations.length
        };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['reservation_groups'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: reservation } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('id', id)
        .single();

      if (reservation && reservation.status === 'checked-in') {
        await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', reservation.room_id);
      }

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const isLoading =
    (queryOptions.guests && guestsLoading) ||
    (queryOptions.rooms && roomsLoading) ||
    (queryOptions.reservations && reservationsLoading) ||
    (queryOptions.reservationGroups && reservationGroupsLoading);

  return {
    guests,
    rooms,
    reservations,
    reservationGroups,
    stats,
    isLoading,
    addGuest: addGuestMutation.mutateAsync,
    updateGuest: updateGuestMutation.mutateAsync,
    deleteGuest: deleteGuestMutation.mutateAsync,
    addRoom: addRoomMutation.mutateAsync,
    updateRoom: updateRoomMutation.mutateAsync,
    deleteRoom: deleteRoomMutation.mutateAsync,
    addReservation: addReservationMutation.mutateAsync,
    updateReservation: updateReservationMutation.mutateAsync,
    deleteReservation: deleteReservationMutation.mutateAsync,
    addReservationGroup: addReservationGroupMutation.mutateAsync,
  };
};
