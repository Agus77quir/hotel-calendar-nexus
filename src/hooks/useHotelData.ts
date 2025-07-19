
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

  // Fetch guests
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
      
      // Cast to proper Guest types
      return (data || []).map(guest => ({
        ...guest,
        is_associated: Boolean(guest.is_associated),
        discount_percentage: Number(guest.discount_percentage) || 0
      })) as Guest[];
    },
    staleTime: 500, // 0.5 seconds
    gcTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch rooms
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
      
      // Cast to proper Room types
      return (data || []).map(room => ({
        ...room,
        type: room.type as Room['type'],
        status: room.status as Room['status'],
        price: Number(room.price),
        capacity: Number(room.capacity),
        amenities: room.amenities || []
      })) as Room[];
    },
    staleTime: 500, // 0.5 seconds
    gcTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch reservations
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
      
      // Cast to proper Reservation types
      return (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as Reservation['status'],
        guests_count: Number(reservation.guests_count),
        total_amount: Number(reservation.total_amount)
      })) as Reservation[];
    },
    staleTime: 500, // 0.5 seconds
    gcTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Calculate stats
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

  // FORCE REFRESH ALL DATA
  const forceRefreshAllData = async () => {
    console.log('🔄 FORCE REFRESH: Starting complete data refresh...');
    
    try {
      // Invalidate all queries first
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await queryClient.invalidateQueries({ queryKey: ['reservations'] });
      await queryClient.invalidateQueries({ queryKey: ['guests'] });
      
      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['guests'] })
      ]);
      
      console.log('✅ FORCE REFRESH: Complete data refresh finished');
    } catch (error) {
      console.error('❌ FORCE REFRESH: Error during refresh:', error);
    }
  };

  // Update reservation WITH GUARANTEED room status sync
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...reservationData }: { id: string } & Partial<Omit<Reservation, 'id'>>) => {
      console.log('🔄 CRITICAL UPDATE: Starting reservation update for:', id, reservationData);
      
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
        
        console.log('🏠 ROOM STATUS UPDATE: Processing status change:', {
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
      console.log('🎉 UPDATE SUCCESS: Starting complete data refresh...');
      
      // Force complete refresh
      await forceRefreshAllData();
      
      // Additional refresh after delay to ensure UI updates
      setTimeout(async () => {
        await forceRefreshAllData();
      }, 1000);
      
      console.log('✅ All data refreshed after reservation update');
    },
    onError: (error) => {
      console.error('❌ MUTATION ERROR:', error);
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
