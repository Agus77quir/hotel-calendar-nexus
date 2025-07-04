import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Guest, Reservation, HotelStats } from '@/types/hotel';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendReservationConfirmationAutomatically } from '@/services/automatedEmailService';

export const useHotelData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Set current user context para audit - optimizado
  useEffect(() => {
    if (user?.email) {
      const setUserContext = async () => {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Context timeout')), 500)
          );
          
          await Promise.race([
            supabase.rpc('set_current_user', { user_name: user.email }),
            timeoutPromise
          ]);
          console.log('User context set for audit:', user.email);
        } catch (error) {
          console.error('Error setting user context (proceeding anyway):', error);
        }
      };
      setUserContext();
    }
  }, [user?.email]);

  // Fetch guests con timeout de 2 segundos
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      console.log('Fetching guests...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Guests fetch timeout')), 2000)
      );
      
      try {
        const fetchPromise = supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error fetching guests:', error);
          return []; 
        }
        
        console.log('Guests fetched:', data?.length || 0);
        return (data || []) as Guest[];
      } catch (error) {
        console.error('Guests fetch failed:', error);
        return []; 
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    retryDelay: 300,
  });

  // Fetch rooms con timeout de 2 segundos
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('Fetching rooms...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Rooms fetch timeout')), 2000)
      );
      
      try {
        const fetchPromise = supabase
          .from('rooms')
          .select('*')
          .order('number');
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error fetching rooms:', error);
          return [];
        }
        
        console.log('Rooms fetched:', data?.length || 0);
        return (data || []) as Room[];
      } catch (error) {
        console.error('Rooms fetch failed:', error);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    retryDelay: 300,
  });

  // Fetch reservations con timeout de 2 segundos
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('Fetching reservations...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Reservations fetch timeout')), 2000)
      );
      
      try {
        const fetchPromise = supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error fetching reservations:', error);
          return [];
        }
        
        console.log('Reservations fetched:', data?.length || 0);
        return (data || []) as Reservation[];
      } catch (error) {
        console.error('Reservations fetch failed:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    retryDelay: 300,
  });

  // Calculate stats efficiently
  const stats: HotelStats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
    totalReservations: reservations.length,
    todayCheckIns: reservations.filter(r => r.check_in === new Date().toISOString().split('T')[0] && r.status === 'confirmed').length,
    todayCheckOuts: reservations.filter(r => r.check_out === new Date().toISOString().split('T')[0] && r.status === 'checked-in').length,
    revenue: reservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
  };

  // Optimized invalidation function
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['guests'] });
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  // Add guest
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
      console.log('Adding guest:', guestData);
      
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding guest:', error);
        throw error;
      }
      
      console.log('Guest added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Update guest
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, ...guestData }: { id: string } & Partial<Omit<Guest, 'id'>>) => {
      console.log('Updating guest:', id, guestData);
      const { data, error } = await supabase
        .from('guests')
        .update(guestData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating guest:', error);
        throw error;
      }
      
      console.log('Guest updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Delete guest
  const deleteGuestMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting guest:', id);
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting guest:', error);
        throw error;
      }
      
      console.log('Guest deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Add room
  const addRoomMutation = useMutation({
    mutationFn: async (roomData: Omit<Room, 'id' | 'created_at'>) => {
      console.log('Adding room:', roomData);
      
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding room:', error);
        throw error;
      }
      
      console.log('Room added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Update room
  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, ...roomData }: { id: string } & Partial<Omit<Room, 'id'>>) => {
      console.log('Updating room:', id, roomData);
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating room:', error);
        throw error;
      }
      
      console.log('Room updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Delete room
  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting room:', id);
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting room:', error);
        throw error;
      }
      
      console.log('Room deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Add reservation with automatic email confirmation
  const addReservationMutation = useMutation({
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Adding reservation:', reservationData);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          created_by: user?.email || 'sistema'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding reservation:', error);
        throw error;
      }
      
      console.log('Reservation added successfully:', data);
      return data;
    },
    onSuccess: async (newReservationData) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      
      toast({
        title: "Reserva creada exitosamente",
        description: "La reserva ha sido registrada. Use el botón de email para enviar confirmación.",
      });

      // Cast the data to proper Reservation type
      const newReservation: Reservation = {
        ...newReservationData,
        status: newReservationData.status as Reservation['status']
      };
    },
  });

  // Update reservation
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...reservationData }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      console.log('Updating reservation:', id, reservationData);
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...reservationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating reservation:', error);
        throw error;
      }
      
      console.log('Reservation updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Delete reservation
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting reservation:', id);
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting reservation:', error);
        throw error;
      }
      
      console.log('Reservation deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
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
