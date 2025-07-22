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
      setRooms(data || []);
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
      setReservations(data || []);
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

  const addGuest = async (guestData: Omit<Guest, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          first_name: guestData.firstName,
          last_name: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          document: guestData.document
        }])
        .select()
        .single();

      if (error) throw error;

      const newGuest: Guest = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        createdAt: new Date(data.created_at)
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

  const updateGuest = async (id: string, guestData: Partial<Omit<Guest, 'id' | 'createdAt'>>) => {
    try {
      const updateData: any = {};
      if (guestData.firstName) updateData.first_name = guestData.firstName;
      if (guestData.lastName) updateData.last_name = guestData.lastName;
      if (guestData.email) updateData.email = guestData.email;
      if (guestData.phone) updateData.phone = guestData.phone;
      if (guestData.document) updateData.document = guestData.document;

      const { data, error } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedGuest: Guest = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        createdAt: new Date(data.created_at)
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

  const addRoom = async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;

      const newRoom: Room = {
        ...data,
        createdAt: new Date(data.created_at)
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

  const updateRoom = async (id: string, roomData: Partial<Omit<Room, 'id' | 'createdAt'>>) => {
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
        createdAt: new Date(data.created_at)
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

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          guest_id: reservationData.guestId,
          room_id: reservationData.roomId,
          check_in: reservationData.checkIn,
          check_out: reservationData.checkOut,
          guests_count: reservationData.guestsCount,
          status: reservationData.status,
          special_requests: reservationData.specialRequests,
          confirmation_number: reservationData.confirmationNumber
        }])
        .select()
        .single();

      if (error) throw error;

      const newReservation: Reservation = {
        id: data.id,
        guestId: data.guest_id,
        roomId: data.room_id,
        checkIn: data.check_in,
        checkOut: data.check_out,
        guestsCount: data.guests_count,
        status: data.status,
        specialRequests: data.special_requests,
        confirmationNumber: data.confirmation_number,
        createdAt: new Date(data.created_at)
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

  const updateReservation = async (id: string, reservationData: Partial<Omit<Reservation, 'id' | 'createdAt'>>) => {
    try {
      const updateData: any = {};
      if (reservationData.guestId) updateData.guest_id = reservationData.guestId;
      if (reservationData.roomId) updateData.room_id = reservationData.roomId;
      if (reservationData.checkIn) updateData.check_in = reservationData.checkIn;
      if (reservationData.checkOut) updateData.check_out = reservationData.checkOut;
      if (reservationData.guestsCount) updateData.guests_count = reservationData.guestsCount;
      if (reservationData.status) updateData.status = reservationData.status;
      if (reservationData.specialRequests) updateData.special_requests = reservationData.specialRequests;
      if (reservationData.confirmationNumber) updateData.confirmation_number = reservationData.confirmationNumber;

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedReservation: Reservation = {
        id: data.id,
        guestId: data.guest_id,
        roomId: data.room_id,
        checkIn: data.check_in,
        checkOut: data.check_out,
        guestsCount: data.guests_count,
        status: data.status,
        specialRequests: data.special_requests,
        confirmationNumber: data.confirmation_number,
        createdAt: new Date(data.created_at)
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
