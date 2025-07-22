
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Guest, Reservation, HotelStats } from '@/types/hotel';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeUpdates } from './useRealtimeUpdates';

export const useHotelData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Activar tiempo real
  useRealtimeUpdates();

  // Configurar contexto de usuario
  useEffect(() => {
    const setUserContext = async () => {
      if (user?.email) {
        try {
          await supabase.rpc('set_current_user', { user_name: user.email });
          console.log('✅ Usuario configurado:', user.email);
        } catch (error) {
          console.error('❌ Error configurando usuario:', error);
        }
      }
    };
    setUserContext();
  }, [user?.email]);

  // Consultas con refetch automático más agresivo
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []) as Guest[];
    },
    staleTime: 0, // Datos siempre se consideran obsoletos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refrescar cada 5 segundos
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) throw error;
      
      return (data || []).map(room => ({
        ...room,
        type: room.type as Room['type'],
        status: room.status as Room['status'],
        price: Number(room.price),
        capacity: Number(room.capacity),
        amenities: room.amenities || []
      })) as Room[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
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
        total_amount: Number(reservation.total_amount),
        confirmation_number: reservation.id
      })) as Reservation[];

      console.log('🔄 RESERVACIONES RECARGADAS:', {
        total: processedData.length,
        confirmed: processedData.filter(r => r.status === 'confirmed').length,
        checkedIn: processedData.filter(r => r.status === 'checked-in').length,
        checkedOut: processedData.filter(r => r.status === 'checked-out').length,
        timestamp: new Date().toISOString()
      });

      return processedData;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Más frecuente para reservas
  });

  // Estadísticas calculadas
  const today = new Date().toISOString().split('T')[0];
  
  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => 
      r.check_in === today && r.status === 'confirmed'
    ).length,
    todayCheckOuts: reservations.filter(r => 
      r.check_out === today && r.status === 'checked-in'
    ).length,
    revenue: reservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  };

  // Mutación optimizada para check-in/check-out con invalidación más agresiva
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      console.log('🔄 ACTUALIZANDO RESERVA:', id, data);
      
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

        if (roomError) console.error('❌ Error actualizando habitación:', roomError);
      }
      
      return updatedReservation;
    },
    onSuccess: async () => {
      console.log('✅ RESERVA ACTUALIZADA - INVALIDANDO TODAS LAS QUERIES');
      
      // Invalidar TODAS las queries para forzar recarga completa
      await queryClient.invalidateQueries();
      
      // Refrescar específicamente las queries críticas
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['guests'] }),
      ]);
      
      console.log('🔄 TODAS LAS QUERIES REFRESCADAS');
    },
    onError: (error) => {
      console.error('❌ ERROR EN MUTACIÓN:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    }
  });

  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, ...roomData }: { id: string } & Partial<Omit<Room, 'id'>>) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
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
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'confirmation_number'>) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          created_by: user?.email || 'sistema'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
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

  const isLoading = guestsLoading || roomsLoading || reservationsLoading;

  return {
    guests,
    rooms,
    reservations,
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
  };
};
