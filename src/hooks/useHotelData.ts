
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

  // Consultas optimizadas
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      console.log('🔄 CONSULTANDO HUÉSPEDES');
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

      console.log('✅ HUÉSPEDES CARGADOS:', processedData.length);
      return processedData;
    },
    staleTime: 0, // Sin caché para actualizaciones inmediatas
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('🔄 CONSULTANDO HABITACIONES');
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

      console.log('✅ HABITACIONES CARGADAS:', processedData.length);
      return processedData;
    },
    staleTime: 0, // Sin caché para actualizaciones inmediatas  
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('🔄 CONSULTANDO RESERVACIONES');
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

      console.log('✅ RESERVACIONES CARGADAS:', {
        total: processedData.length,
        confirmed: processedData.filter(r => r.status === 'confirmed').length,
        checkedIn: processedData.filter(r => r.status === 'checked-in').length,
        checkedOut: processedData.filter(r => r.status === 'checked-out').length,
        timestamp: new Date().toISOString()
      });

      return processedData;
    },
    staleTime: 0, // Sin caché para actualizaciones inmediatas
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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

  // Mutación optimizada para check-in/check-out
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
      console.log('✅ RESERVA ACTUALIZADA - REFRESCANDO DATOS');
      
      // Invalidar las queries específicas de manera ordenada
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      console.log('🔄 DATOS REFRESCADOS CORRECTAMENTE');
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

      const { data, error } = await supabase
        .from('guests')
        .insert([dbGuestData])
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
    mutationFn: async ({ id, updateGroupPrice = true, ...roomData }: { id: string; updateGroupPrice?: boolean } & Partial<Omit<Room, 'id'>>) => {
      console.log('🔄 ACTUALIZANDO HABITACIÓN:', id, roomData, 'Actualizar grupo:', updateGroupPrice);
      
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

        console.log(`✅ PRECIO ACTUALIZADO para todas las habitaciones tipo: ${currentRoom.type}`);
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
      console.error('❌ Error actualizando habitación:', error);
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
      console.log('🔄 CREANDO NUEVA RESERVA:', reservationData);

      // Realizamos el INSERT sin .select() para evitar fallos por permisos de SELECT con RLS
      const { error } = await supabase
        .from('reservations')
        .insert([reservationData]);

      if (error) {
        console.error('❌ ERROR EN INSERT:', error);
        throw error;
      }

      console.log('✅ RESERVA CREADA EXITOSAMENTE');
      return true;
    },
    onSuccess: async () => {
      console.log('✅ REFRESCANDO DATOS DESPUÉS DE CREAR RESERVA');
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      console.error('❌ ERROR EN MUTACIÓN DE RESERVA:', error);
      // No mostrar toast aquí - se maneja en el componente
    },
  });

  // Inserción masiva de reservas en una sola llamada (con fallback a inserciones individuales)
  const addReservationsBulkMutation = useMutation({
    mutationFn: async (
      reservationsData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>[]
    ) => {
      console.log('🔄 CREANDO RESERVAS (BULK):', reservationsData.length);
      
      // Intento 1: inserción en bloque
      const { data, error: bulkError } = await supabase
        .from('reservations')
        .insert(reservationsData)
        .select();
        
      if (!bulkError && data) {
        console.log('✅ RESERVAS CREADAS (BULK):', data.length);
        return { success: true, data: data, created: data.length };
      }

      console.warn('⚠️ BULK FALLÓ, CAMBIO A INSERCIÓN INDIVIDUAL:', bulkError);

      // Intento 2: inserción una por una (permite éxito parcial)
      const createdReservations: any[] = [];
      const failures: { item: any; error: any }[] = [];
      
      for (const item of reservationsData) {
        const { data: individualData, error } = await supabase
          .from('reservations')
          .insert([item])
          .select()
          .single();
          
        if (error) {
          console.error('❌ ERROR INDIVIDUAL:', error);
          failures.push({ item, error });
        } else {
          createdReservations.push(individualData);
        }
      }

      if (createdReservations.length === 0) {
        // Si ninguna pudo crearse, propaga el error original
        throw bulkError || new Error('No se pudieron crear las reservas');
      }

      console.log(`✅ RESERVAS CREADAS INDIVIDUALMENTE: ${createdReservations.length}, ❌ fallidas: ${failures.length}`);
      return { 
        success: true, 
        data: createdReservations,
        created: createdReservations.length, 
        partial: failures.length > 0 
      };
    },
    onSuccess: async (result) => {
      console.log('✅ RESERVAS MÚLTIPLES CREADAS - REFRESCANDO DATOS');
      console.log('📊 RESULTADO:', result);
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error) => {
      console.error('❌ ERROR CREANDO RESERVAS MÚLTIPLES:', error);
      // No mostrar toast aquí - se maneja en el componente
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
    addReservationsBulk: addReservationsBulkMutation.mutateAsync,
  };
};
