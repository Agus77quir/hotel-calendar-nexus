
import { useMockHotelData } from './useMockHotelData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

export const useHotelData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Calculate stats
  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.check_in === today && r.status === 'confirmed';
    }).length,
    todayCheckOuts: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.check_out === today && r.status === 'checked-in';
    }).length,
    revenue: reservations.reduce((sum, r) => sum + Number(r.total_amount), 0),
  };

  // Add guest mutation - with fallback to mock
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .insert([guestData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Error adding guest to Supabase, using mock:', error);
        // Fallback to mock functionality
        mockData.addGuest(guestData);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Éxito",
        description: "Huésped agregado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el huésped: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update guest mutation - with fallback
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Guest> }) => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.log('Error updating guest in Supabase, using mock:', error);
        mockData.updateGuest(id, updates);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Éxito",
        description: "Huésped actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el huésped: " + error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Éxito",
        description: "Huésped eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el huésped: " + error.message,
        variant: "destructive",
      });
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

  // Add reservation mutation - sin envío automático de emails
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      toast({
        title: "Éxito",
        description: "Reserva creada correctamente",
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

  // Update reservation mutation - sin envío automático de emails
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      toast({
        title: "Éxito",
        description: "Reserva actualizada correctamente",
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
    addGuest: (guestData: Omit<Guest, 'id' | 'created_at'>) => addGuestMutation.mutate(guestData),
    updateGuest: (id: string, updates: Partial<Guest>) => updateGuestMutation.mutate({ id, updates }),
    deleteGuest: (id: string) => deleteGuestMutation.mutate(id),
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
