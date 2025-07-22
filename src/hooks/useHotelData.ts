
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Guest, Room, Reservation } from '@/types/hotel';
import { toast } from 'sonner';

export const useHotelData = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Error al cargar huéspedes');
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');

      if (error) throw error;
      setRooms(data as Room[] || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Error al cargar habitaciones');
    }
  };

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform data to match Reservation interface
      const transformedData = (data || []).map(item => ({
        ...item,
        confirmation_number: item.id // Use id as confirmation number for now
      }));
      setReservations(transformedData as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Error al cargar reservas');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGuests(), fetchRooms(), fetchReservations()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const addGuest = async (guestData: Omit<Guest, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          first_name: guestData.first_name,
          last_name: guestData.last_name,
          email: guestData.email,
          phone: guestData.phone,
          document: guestData.document,
          nationality: guestData.nationality || 'No especificada'
        }])
        .select()
        .single();

      if (error) throw error;

      const newGuest: Guest = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        nationality: data.nationality,
        created_at: data.created_at
      };

      setGuests(prev => [newGuest, ...prev]);
      toast.success('Huésped agregado exitosamente');
      return newGuest;
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Error al agregar huésped');
      throw error;
    }
  };

  const updateGuest = async (id: string, guestData: Partial<Omit<Guest, 'id' | 'created_at'>>) => {
    try {
      const updateData: any = {};
      if (guestData.first_name) updateData.first_name = guestData.first_name;
      if (guestData.last_name) updateData.last_name = guestData.last_name;
      if (guestData.email) updateData.email = guestData.email;
      if (guestData.phone) updateData.phone = guestData.phone;
      if (guestData.document) updateData.document = guestData.document;
      if (guestData.nationality) updateData.nationality = guestData.nationality;

      const { data, error } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedGuest: Guest = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        nationality: data.nationality,
        created_at: data.created_at
      };

      setGuests(prev => prev.map(guest => guest.id === id ? updatedGuest : guest));
      toast.success('Huésped actualizado exitosamente');
      return updatedGuest;
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Error al actualizar huésped');
      throw error;
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGuests(prev => prev.filter(guest => guest.id !== id));
      toast.success('Huésped eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Error al eliminar huésped');
      throw error;
    }
  };

  const addRoom = async (roomData: Omit<Room, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;

      const newRoom: Room = {
        ...data,
        created_at: data.created_at
      };

      setRooms(prev => [...prev, newRoom]);
      toast.success('Habitación agregada exitosamente');
      return newRoom;
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Error al agregar habitación');
      throw error;
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Omit<Room, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRoom: Room = {
        ...data,
        created_at: data.created_at
      };

      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      toast.success('Habitación actualizada exitosamente');
      return updatedRoom;
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Error al actualizar habitación');
      throw error;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRooms(prev => prev.filter(room => room.id !== id));
      toast.success('Habitación eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Error al eliminar habitación');
      throw error;
    }
  };

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          guest_id: reservationData.guest_id,
          room_id: reservationData.room_id,
          check_in: reservationData.check_in,
          check_out: reservationData.check_out,
          guests_count: reservationData.guests_count,
          status: reservationData.status,
          special_requests: reservationData.special_requests,
          total_amount: reservationData.total_amount
        }])
        .select()
        .single();

      if (error) throw error;

      const newReservation: Reservation = {
        ...data,
        confirmation_number: data.id // Use id as confirmation number for now
      };

      setReservations(prev => [newReservation, ...prev]);
      toast.success('Reserva agregada exitosamente');
      return newReservation;
    } catch (error) {
      console.error('Error adding reservation:', error);
      toast.error('Error al agregar reserva');
      throw error;
    }
  };

  const updateReservation = async (id: string, reservationData: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const updateData: any = {};
      if (reservationData.guest_id) updateData.guest_id = reservationData.guest_id;
      if (reservationData.room_id) updateData.room_id = reservationData.room_id;
      if (reservationData.check_in) updateData.check_in = reservationData.check_in;
      if (reservationData.check_out) updateData.check_out = reservationData.check_out;
      if (reservationData.guests_count) updateData.guests_count = reservationData.guests_count;
      if (reservationData.status) updateData.status = reservationData.status;
      if (reservationData.special_requests) updateData.special_requests = reservationData.special_requests;
      if (reservationData.total_amount) updateData.total_amount = reservationData.total_amount;

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedReservation: Reservation = {
        ...data,
        confirmation_number: data.id // Use id as confirmation number for now
      };

      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? updatedReservation : reservation
      ));
      toast.success('Reserva actualizada exitosamente');
      return updatedReservation;
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Error al actualizar reserva');
      throw error;
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      toast.success('Reserva eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Error al eliminar reserva');
      throw error;
    }
  };

  return {
    guests,
    rooms,
    reservations,
    loading,
    addGuest,
    updateGuest,
    deleteGuest,
    addRoom,
    updateRoom,
    deleteRoom,
    addReservation,
    updateReservation,
    deleteReservation,
  };
};
