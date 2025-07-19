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

  // Set current user context para audit
  useEffect(() => {
    if (user?.email) {
      const setUserContext = async () => {
        try {
          await supabase.rpc('set_current_user', { 
            user_name: user.email 
          });
          console.log('✅ User context set for audit:', user.email);
        } catch (error) {
          console.error('❌ Error setting user context:', error);
        }
      };
      setUserContext();
    }
  }, [user?.email]);

  // REAL-TIME SUBSCRIPTIONS FOR AUTOMATIC UPDATES
  useEffect(() => {
    console.log('🔄 REALTIME: Setting up real-time subscriptions for automatic updates');
    
    // Subscribe to reservations changes
    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('📡 REALTIME: Reservations change detected:', payload);
          // Invalidate and refetch reservations immediately
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
          queryClient.refetchQueries({ queryKey: ['reservations'] });
        }
      )
      .subscribe();

    // Subscribe to rooms changes
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('📡 REALTIME: Rooms change detected:', payload);
          // Invalidate and refetch rooms immediately
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
          queryClient.refetchQueries({ queryKey: ['rooms'] });
        }
      )
      .subscribe();

    // Subscribe to guests changes
    const guestsChannel = supabase
      .channel('guests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests'
        },
        (payload) => {
          console.log('📡 REALTIME: Guests change detected:', payload);
          // Invalidate and refetch guests immediately
          queryClient.invalidateQueries({ queryKey: ['guests'] });
          queryClient.refetchQueries({ queryKey: ['guests'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔄 REALTIME: Cleaning up real-time subscriptions');
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(guestsChannel);
    };
  }, [queryClient]);

  // Fetch guests with optimized caching
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      console.log('🔄 Fetching guests...');
      
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching guests:', error);
        throw error;
      }
      
      console.log('✅ Guests fetched:', data?.length || 0);
      
      return (data || []).map(guest => ({
        ...guest,
        is_associated: Boolean(guest.is_associated),
        discount_percentage: Number(guest.discount_percentage) || 0
      })) as Guest[];
    },
    staleTime: 1000, // 1 second
    gcTime: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 3000, // Refetch every 3 seconds for critical data
  });

  // Fetch rooms with optimized caching
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('🔄 Fetching rooms...');
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) {
        console.error('❌ Error fetching rooms:', error);
        throw error;
      }
      
      console.log('✅ Rooms fetched:', data?.length || 0);
      console.log('✅ Room statuses:', {
        available: data?.filter(r => r.status === 'available').length || 0,
        occupied: data?.filter(r => r.status === 'occupied').length || 0,
        maintenance: data?.filter(r => r.status === 'maintenance').length || 0,
        cleaning: data?.filter(r => r.status === 'cleaning').length || 0
      });
      
      return (data || []).map(room => ({
        ...room,
        type: room.type as Room['type'],
        status: room.status as Room['status'],
        price: Number(room.price),
        capacity: Number(room.capacity),
        amenities: room.amenities || []
      })) as Room[];
    },
    staleTime: 1000, // 1 second
    gcTime: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 3000, // Refetch every 3 seconds for critical data
  });

  // Fetch reservations with optimized caching
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('🔄 Fetching reservations...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching reservations:', error);
        throw error;
      }
      
      console.log('✅ Reservations fetched:', data?.length || 0);
      console.log('✅ Reservation statuses:', {
        confirmed: data?.filter(r => r.status === 'confirmed').length || 0,
        'checked-in': data?.filter(r => r.status === 'checked-in').length || 0,
        'checked-out': data?.filter(r => r.status === 'checked-out').length || 0,
        cancelled: data?.filter(r => r.status === 'cancelled').length || 0
      });
      
      return (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as Reservation['status'],
        guests_count: Number(reservation.guests_count),
        total_amount: Number(reservation.total_amount)
      })) as Reservation[];
    },
    staleTime: 1000, // 1 second
    gcTime: 5000, // 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 3000, // Refetch every 3 seconds for critical data
  });

  // Calculate stats with memoization
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

  // ENHANCED FORCE REFRESH WITH IMMEDIATE UI UPDATES
  const forceRefreshAllData = async () => {
    console.log('🚀 ENHANCED FORCE REFRESH: Starting immediate complete data refresh...');
    
    try {
      // Clear all cache immediately
      queryClient.clear();
      
      // Force immediate background refetch of all queries
      const refreshPromises = [
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['guests'] }),
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['guests'] })
      ];
      
      await Promise.all(refreshPromises);
      
      console.log('✅ ENHANCED FORCE REFRESH: All data refreshed successfully');
      
      // Additional refresh after a short delay to ensure UI synchronization
      setTimeout(async () => {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['rooms'] }),
          queryClient.refetchQueries({ queryKey: ['reservations'] }),
          queryClient.refetchQueries({ queryKey: ['guests'] })
        ]);
        console.log('✅ ENHANCED FORCE REFRESH: Secondary refresh completed');
      }, 500);
      
    } catch (error) {
      console.error('❌ ENHANCED FORCE REFRESH: Error during refresh:', error);
    }
  };

  // CRITICAL: Enhanced update reservation with GUARANTEED synchronization
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...reservationData }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      console.log('🎯 CRITICAL UPDATE: Starting ENHANCED reservation update for:', id, reservationData);
      
      // Get current reservation to know which room to update
      const { data: currentReservation, error: getCurrentError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('id', id)
        .single();
      
      if (getCurrentError) {
        console.error('❌ Error getting current reservation:', getCurrentError);
        throw getCurrentError;
      }

      console.log('📋 Current reservation state:', currentReservation);

      // Update the reservation
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
        console.error('❌ Error updating reservation:', reservationError);
        throw reservationError;
      }

      console.log('✅ Reservation updated successfully:', updatedReservation);

      // CRITICAL: Update room status if reservation status changed
      if (reservationData.status && currentReservation.room_id) {
        let newRoomStatus: Room['status'];
        
        console.log('🏠 ENHANCED ROOM STATUS UPDATE: Processing status change:', {
          reservationId: id,
          roomId: currentReservation.room_id,
          oldReservationStatus: currentReservation.status,
          newReservationStatus: reservationData.status
        });
        
        switch (reservationData.status) {
          case 'checked-in':
            newRoomStatus = 'occupied';
            console.log('🔴 Setting room to OCCUPIED due to check-in');
            break;
          case 'checked-out':
            newRoomStatus = 'available';
            console.log('🟢 Setting room to AVAILABLE due to check-out');
            break;
          case 'cancelled':
            newRoomStatus = 'available';
            console.log('🟢 Setting room to AVAILABLE due to cancellation');
            break;
          default:
            newRoomStatus = 'available';
            console.log('🟢 Setting room to AVAILABLE for status:', reservationData.status);
        }

        // Update room status
        console.log(`🔄 Updating room ${currentReservation.room_id} to status: ${newRoomStatus}`);
        
        const { data: updatedRoom, error: roomError } = await supabase
          .from('rooms')
          .update({ status: newRoomStatus })
          .eq('id', currentReservation.room_id)
          .select()
          .single();

        if (roomError) {
          console.error('❌ CRITICAL ERROR: Failed to update room status:', roomError);
          throw new Error(`Failed to update room status: ${roomError.message}`);
        } else {
          console.log('✅ ROOM STATUS UPDATED SUCCESSFULLY:', {
            roomId: currentReservation.room_id,
            newStatus: newRoomStatus,
            updatedRoom: updatedRoom
          });
        }
      }
      
      return updatedReservation;
    },
    onSuccess: async () => {
      console.log('🎉 ENHANCED UPDATE SUCCESS: Starting immediate complete data refresh...');
      
      // IMMEDIATE: Clear cache and refresh data
      queryClient.clear();
      
      // Force immediate refresh of all data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['guests'] }),
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['guests'] })
      ]);
      
      // GUARANTEE: Additional refresh cycles to ensure UI synchronization
      setTimeout(async () => {
        await forceRefreshAllData();
      }, 200);
      
      setTimeout(async () => {
        await forceRefreshAllData();
      }, 1000);
      
      console.log('✅ ENHANCED: All data refreshed after reservation update with multiple refresh cycles');
    },
    onError: (error) => {
      console.error('❌ ENHANCED MUTATION ERROR:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    }
  });

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

  // Add reservation
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
    onSuccess: async () => {
      await forceRefreshAllData();
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
    onSuccess: async () => {
      await forceRefreshAllData();
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
    forceRefresh: forceRefreshAllData
  };
};
