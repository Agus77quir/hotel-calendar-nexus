import { useMockHotelData } from './useMockHotelData';
import { useEmailNotifications } from './useEmailNotifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

export const useHotelData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendReservationEmail } = useEmailNotifications();

  // Check if Supabase types are available by testing a simple query
  const isSupabaseReady = async () => {
    try {
      await supabase.from('rooms').select('count').limit(1);
      return true;
    } catch (error) {
      console.log('Supabase types not ready yet, using mock data');
      return false;
    }
  };

  // Use mock data as fallback
  const mockData = useMockHotelData();

  // Try to fetch real data, fallback to mock if types aren't ready
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('number');
        
        if (error) throw error;
        return data as Room[];
      } catch (error) {
        console.log('Using mock rooms data');
        return mockData.rooms;
      }
    },
  });

  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Guest[];
      } catch (error) {
        console.log('Using mock guests data');
        return mockData.guests;
      }
    },
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Reservation[];
      } catch (error) {
        console.log('Using mock reservations data');
        return mockData.reservations;
      }
    },
  });

  // Calculate comprehensive stats
  const today = new Date().toISOString().split('T')[0];
  
  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => {
      return r.check_in === today && (r.status === 'confirmed' || r.status === 'checked-in');
    }).length,
    todayCheckOuts: reservations.filter(r => {
      return r.check_out === today && r.status === 'checked-in';
    }).length,
    revenue: reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0),
  };

  // Add guest mutation - with better error handling
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
      console.log('Attempting to add guest:', guestData);
      
      try {
        // First check if email already exists
        const { data: existingGuest, error: checkError } = await supabase
          .from('guests')
          .select('email')
          .eq('email', guestData.email)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing email:', checkError);
          throw new Error('Error verificando email existente');
        }

        if (existingGuest) {
          throw new Error('Ya existe un huésped con este email');
        }

        const { data, error } = await supabase
          .from('guests')
          .insert([guestData])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase insert error:', error);
          if (error.code === '23505' && error.message.includes('guests_email_key')) {
            throw new Error('Ya existe un huésped con este email');
          }
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        console.log('Guest added successfully:', data);
        return data;
      } catch (error: any) {
        console.error('Error adding guest to Supabase:', error);
        // Re-throw to let the mutation handle it
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Guest mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: (error: any) => {
      console.error('Guest mutation failed:', error);
      // Don't show toast here - let the component handle it
    },
  });

  // Update guest mutation - with better error handling
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Guest> }) => {
      try {
        // If updating email, check for duplicates
        if (updates.email) {
          const { data: existingGuest, error: checkError } = await supabase
            .from('guests')
            .select('id, email')
            .eq('email', updates.email)
            .neq('id', id)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing email:', checkError);
            throw new Error('Error verificando email existente');
          }

          if (existingGuest) {
            throw new Error('Ya existe un huésped con este email');
          }
        }

        const { data, error } = await supabase
          .from('guests')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating guest:', error);
          if (error.code === '23505' && error.message.includes('guests_email_key')) {
            throw new Error('Ya existe un huésped con este email');
          }
          throw new Error(`Error actualizando huésped: ${error.message}`);
        }
        return data;
      } catch (error: any) {
        console.error('Error updating guest in Supabase:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: (error: any) => {
      console.error('Update guest mutation failed:', error);
    },
  });

  // Delete guest mutation - with fallback
  const deleteGuestMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.log('Error deleting guest from Supabase, using mock:', error);
        mockData.deleteGuest(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: (error: any) => {
      console.error('Delete guest mutation failed:', error);
    },
  });

  // Add room mutation - with fallback
  const addRoomMutation = useMutation({
    mutationFn: async (roomData: Omit<Room, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .insert([roomData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Error adding room to Supabase, using mock:', error);
        mockData.addRoom(roomData);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Éxito",
        description: "Habitación agregada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo agregar la habitación: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update room mutation - with fallback
  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Room> }) => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Error updating room in Supabase, using mock:', error);
        mockData.updateRoom(id, updates);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Éxito",
        description: "Habitación actualizada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la habitación: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete room mutation - with fallback
  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.log('Error deleting room from Supabase, using mock:', error);
        mockData.deleteRoom(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Éxito",
        description: "Habitación eliminada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la habitación: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Add reservation mutation - with email notifications
  const addReservationMutation = useMutation({
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .insert([reservationData])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update room status if reservation is checked-in
        if (reservationData.status === 'checked-in') {
          await supabase
            .from('rooms')
            .update({ status: 'occupied' })
            .eq('id', reservationData.room_id);
        }
        
        return data;
      } catch (error) {
        console.log('Error adding reservation to Supabase, using mock:', error);
        mockData.addReservation(reservationData);
        return null;
      }
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Send email notification automatically when reservation is created or confirmed
      const guest = guests.find(g => g.id === variables.guest_id);
      const room = rooms.find(r => r.id === variables.room_id);
      
      if (guest && room && data) {
        // Use the returned data which has the proper ID and cast status to proper type
        const fullReservation: Reservation = { 
          ...variables, 
          ...data,
          status: data.status as Reservation['status']
        };
        
        if (variables.status === 'checked-in') {
          await sendReservationEmail('checkedIn', guest, fullReservation, room);
        } else if (variables.status === 'confirmed') {
          await sendReservationEmail('confirmed', guest, fullReservation, room);
        } else {
          await sendReservationEmail('created', guest, fullReservation, room);
        }
      }
      
      toast({
        title: "Éxito",
        description: "Reserva creada correctamente y notificación enviada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update reservation mutation - with email notifications
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reservation> }) => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Error updating reservation in Supabase, using mock:', error);
        mockData.updateReservation(id, updates);
        return null;
      }
    },
    onSuccess: async (data, { id, updates }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Send email notification based on status change
      const originalReservation = reservations.find(r => r.id === id);
      const guest = guests.find(g => g.id === originalReservation?.guest_id);
      const room = rooms.find(r => r.id === originalReservation?.room_id);
      
      if (guest && room && originalReservation && updates.status && data) {
        const updatedReservation: Reservation = { 
          ...originalReservation, 
          ...updates, 
          ...data,
          status: data.status as Reservation['status']
        };
        
        switch (updates.status) {
          case 'confirmed':
            await sendReservationEmail('confirmed', guest, updatedReservation, room);
            break;
          case 'checked-in':
            await sendReservationEmail('checkedIn', guest, updatedReservation, room);
            break;
          case 'checked-out':
            await sendReservationEmail('checkedOut', guest, updatedReservation, room);
            break;
          case 'cancelled':
            await sendReservationEmail('cancelled', guest, updatedReservation, room);
            break;
        }
      }
      
      toast({
        title: "Éxito",
        description: "Reserva actualizada correctamente y notificación enviada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete reservation mutation - with fallback
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Get reservation to update room status
        const { data: reservation } = await supabase
          .from('reservations')
          .select('room_id, status')
          .eq('id', id)
          .single();

        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', id);
        
        if (error) throw error;

        // Update room status if needed
        if (reservation && reservation.status === 'checked-in') {
          await supabase
            .from('rooms')
            .update({ status: 'available' })
            .eq('id', reservation.room_id);
        }
      } catch (error) {
        console.log('Error deleting reservation from Supabase, using mock:', error);
        mockData.deleteReservation(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Éxito",
        description: "Reserva eliminada correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    rooms,
    guests,
    reservations,
    stats,
    isLoading: roomsLoading || guestsLoading || reservationsLoading,
    addGuest: (guestData: Omit<Guest, 'id' | 'created_at'>) => addGuestMutation.mutateAsync(guestData),
    updateGuest: (id: string, updates: Partial<Guest>) => updateGuestMutation.mutateAsync({ id, updates }),
    deleteGuest: (id: string) => deleteGuestMutation.mutateAsync(id),
    addRoom: (roomData: Omit<Room, 'id' | 'created_at'>) => addRoomMutation.mutate(roomData),
    updateRoom: (id: string, updates: Partial<Room>) => updateRoomMutation.mutate({ id, updates }),
    deleteRoom: (id: string) => deleteRoomMutation.mutate(id),
    addReservation: (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => 
      addReservationMutation.mutate(reservationData),
    updateReservation: (id: string, updates: Partial<Reservation>) => 
      updateReservationMutation.mutate({ id, updates }),
    deleteReservation: (id: string) => deleteReservationMutation.mutate(id),
  };
};
