
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Guest, Reservation } from '@/types/hotel';
import { useAuth } from '@/contexts/AuthContext';

export const useHotelData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Set current user context for audit purposes
  useEffect(() => {
    if (user?.email) {
      const setUserContext = async () => {
        try {
          await supabase.rpc('set_current_user', { user_name: user.email });
          console.log('User context set for audit:', user.email);
        } catch (error) {
          console.error('Error setting user context:', error);
        }
      };
      setUserContext();
    }
  }, [user]);

  // Fetch guests
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      console.log('Fetching guests...');
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching guests:', error);
        throw error;
      }
      
      console.log('Guests fetched:', data?.length || 0);
      return (data || []) as Guest[];
    },
  });

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('Fetching rooms...');
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }
      
      console.log('Rooms fetched:', data?.length || 0);
      return (data || []) as Room[];
    },
  });

  // Fetch reservations
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      console.log('Fetching reservations...');
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching reservations:', error);
        throw error;
      }
      
      console.log('Reservations fetched:', data?.length || 0);
      return (data || []) as Reservation[];
    },
  });

  // Generate next sequential ID for reservations
  const getNextReservationId = async () => {
    try {
      const { data: existingReservations, error } = await supabase
        .from('reservations')
        .select('id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations for ID:', error);
        return '01';
      }

      // Find the highest numeric ID
      let maxNumber = 0;
      existingReservations?.forEach(reservation => {
        const matches = reservation.id.match(/\d+/g);
        if (matches) {
          const numbers = matches.map(Number);
          const maxInId = Math.max(...numbers);
          if (maxInId > maxNumber) {
            maxNumber = maxInId;
          }
        }
      });

      // Next ID will be highest number + 1, formatted with leading zeros
      const nextNumber = maxNumber + 1;
      return nextNumber.toString().padStart(2, '0');
    } catch (error) {
      console.error('Error generating sequential ID:', error);
      return '01';
    }
  };

  // Add guest
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Omit<Guest, 'id' | 'createdAt'>) => {
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
    mutationFn: async ({ id, ...guestData }: Partial<Guest> & { id: string }) => {
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
    mutationFn: async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
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
    mutationFn: async ({ id, ...roomData }: Partial<Room> & { id: string }) => {
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
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('Adding reservation:', reservationData);
      
      // Generate sequential ID
      const sequentialId = await getNextReservationId();
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          id: sequentialId
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  // Update reservation
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, ...reservationData }: Partial<Reservation> & { id: string }) => {
      console.log('Updating reservation:', id, reservationData);
      const { data, error } = await supabase
        .from('reservations')
        .update(reservationData)
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
