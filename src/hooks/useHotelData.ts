
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, Reservation, Guest, HotelStats } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

export const useHotelData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) throw error;
      return data as Room[];
    },
  });

  // Fetch guests
  const { data: guests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Guest[];
    },
  });

  // Fetch reservations
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Reservation[];
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

  // Add guest mutation
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

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Guest> }) => {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

  // Delete guest mutation
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

  // Add reservation mutation
  const addReservationMutation = useMutation({
    mutationFn: async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
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

  // Update reservation mutation
  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reservation> }) => {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

  // Delete reservation mutation
  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
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
    addReservation: (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => 
      addReservationMutation.mutate(reservationData),
    updateReservation: (id: string, updates: Partial<Reservation>) => 
      updateReservationMutation.mutate({ id, updates }),
    deleteReservation: (id: string) => deleteReservationMutation.mutate(id),
  };
};
