
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Guest, Reservation, HotelStats } from '@/types/hotel';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useHotelData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Set current user context para audit - optimizado para Safari
  useEffect(() => {
    if (user?.email) {
      const setUserContext = async () => {
        try {
          // Safari-compatible timeout implementation
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 500);
          
          try {
            await supabase.rpc('set_current_user', { 
              user_name: user.email 
            });
            clearTimeout(timeoutId);
            console.log('User context set for audit:', user.email);
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        } catch (error) {
          console.error('Error setting user context (proceeding anyway):', error);
        }
      };
      setUserContext();
    }
  }, [user?.email]);

  // Safari-compatible fetch function
  const safeFetch = async (queryFn: () => Promise<any>, timeoutMs: number) => {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);

      try {
        const result = await queryFn();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  };

  // Fetch guests con timeout de 2 segundos - Safari compatible
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      console.log('Fetching guests...');
      
      try {
        const result = await safeFetch(async () => {
          const { data, error } = await supabase
            .from('guests')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (error) {
            console.error('Error fetching guests:', error);
            return [];
          }
          
          return data || [];
        }, 2000);
        
        console.log('Guests fetched:', (result as any[])?.length || 0);
        return result as Guest[];
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

  // Fetch rooms con timeout de 2 segundos - Safari compatible
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('Fetching rooms...');
      
      try {
        const result = await safeFetch(async () => {
          const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('number');
          
          if (error) {
            console.error('Error fetching rooms:', error);
            return [];
          }
          
          return data || [];
        }, 2000);
        
        console.log('Rooms fetched:', (result as any[])?.length || 0);
        return result as Room[];
      } catch (error) {
        console.error('Rooms fetch failed:', error);
        return [];
      }
    },
    staleTime: 5 * 1000, // Reduce to 5 seconds for faster updates
    gcTime: 10 * 60 * 1000,
    retry: 1,
    retryDelay: 300,
  });

  // Fetch reservations con timeout de 2 segundos - Safari compatible
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('Fetching reservations...');
      
      try {
        const result = await safeFetch(async () => {
          const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (error) {
            console.error('Error fetching reservations:', error);
            return [];
          }
          
          return data || [];
        }, 2000);
        
        console.log('Reservations fetched:', (result as any[])?.length || 0);
        return result as Reservation[];
      } catch (error) {
        console.error('Reservations fetch failed:', error);
        return [];
      }
    },
    staleTime: 2 * 1000, // Reduce to 2 seconds for faster updates
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

  // Update reservation with PROPER automatic room status management
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...reservationData }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      console.log('Updating reservation:', id, reservationData);
      
      // First get the current reservation to know which room to update
      const { data: currentReservation, error: getCurrentError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('id', id)
        .single();
      
      if (getCurrentError) {
        console.error('Error getting current reservation:', getCurrentError);
        throw getCurrentError;
      }

      // Update the reservation first
      const { data: updatedReservation, error: reservationError } = await supabase
        .from('reservations')
        .update({
          ...reservationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (reservationError) {
        console.error('Error updating reservation:', reservationError);
        throw reservationError;
      }

      // Now update room status based on the new reservation status
      if (reservationData.status && currentReservation.room_id) {
        let newRoomStatus: Room['status'];
        
        console.log('Updating room status for reservation status change:', {
          reservationId: id,
          roomId: currentReservation.room_id,
          oldStatus: currentReservation.status,
          newStatus: reservationData.status
        });
        
        switch (reservationData.status) {
          case 'checked-in':
            newRoomStatus = 'occupied';
            console.log('Setting room to occupied due to check-in');
            break;
          case 'checked-out':
            newRoomStatus = 'available';
            console.log('Setting room to available due to check-out');
            break;
          case 'cancelled':
            newRoomStatus = 'available';
            console.log('Setting room to available due to cancellation');
            break;
          default:
            // For 'confirmed' status, room should remain available until check-in
            newRoomStatus = 'available';
            console.log('Setting room to available for confirmed status');
        }

        // Update room status
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: newRoomStatus })
          .eq('id', currentReservation.room_id);

        if (roomError) {
          console.error('Error updating room status:', roomError);
          // Don't throw error here, reservation update succeeded
        } else {
          console.log(`✅ Room ${currentReservation.room_id} status updated to ${newRoomStatus} successfully`);
        }
      }
      
      console.log('Reservation updated successfully:', updatedReservation);
      return updatedReservation;
    },
    onSuccess: () => {
      // Force immediate refresh of both queries
      console.log('🔄 Forcing immediate refresh of rooms and reservations data');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Also refetch immediately
      queryClient.refetchQueries({ queryKey: ['rooms'] });
      queryClient.refetchQueries({ queryKey: ['reservations'] });
    },
  });

  // Delete reservation
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting reservation:', id);
      
      // Get reservation details to free up the room
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('id', id)
        .single();

      if (!fetchError && reservation && reservation.status === 'checked-in') {
        // Free up the room if reservation was checked-in
        await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', reservation.room_id);
      }

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
