
import { useCallback } from 'react';
import { useHotelData } from './useHotelData';
import { useUserContext } from './useUserContext';
import { Guest, Room, Reservation } from '@/types/hotel';

export const useHotelDataWithContext = () => {
  const hotelData = useHotelData();
  const { executeWithUserContext } = useUserContext();

  const createGuest = useCallback(async (guestData: Omit<Guest, 'id' | 'createdAt'>) => {
    return executeWithUserContext(() => hotelData.createGuest(guestData));
  }, [hotelData.createGuest, executeWithUserContext]);

  const updateGuest = useCallback(async (id: string, guestData: Partial<Guest>) => {
    return executeWithUserContext(() => hotelData.updateGuest(id, guestData));
  }, [hotelData.updateGuest, executeWithUserContext]);

  const deleteGuest = useCallback(async (id: string) => {
    return executeWithUserContext(() => hotelData.deleteGuest(id));
  }, [hotelData.deleteGuest, executeWithUserContext]);

  const createRoom = useCallback(async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    return executeWithUserContext(() => hotelData.createRoom(roomData));
  }, [hotelData.createRoom, executeWithUserContext]);

  const updateRoom = useCallback(async (id: string, roomData: Partial<Room>) => {
    return executeWithUserContext(() => hotelData.updateRoom(id, roomData));
  }, [hotelData.updateRoom, executeWithUserContext]);

  const deleteRoom = useCallback(async (id: string) => {
    return executeWithUserContext(() => hotelData.deleteRoom(id));
  }, [hotelData.deleteRoom, executeWithUserContext]);

  const createReservation = useCallback(async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    return executeWithUserContext(() => hotelData.createReservation(reservationData));
  }, [hotelData.createReservation, executeWithUserContext]);

  const updateReservation = useCallback(async (id: string, reservationData: Partial<Reservation>) => {
    return executeWithUserContext(() => hotelData.updateReservation(id, reservationData));
  }, [hotelData.updateReservation, executeWithUserContext]);

  const deleteReservation = useCallback(async (id: string) => {
    return executeWithUserContext(() => hotelData.deleteReservation(id));
  }, [hotelData.deleteReservation, executeWithUserContext]);

  return {
    // Mantener todos los datos de solo lectura del hook original
    guests: hotelData.guests,
    rooms: hotelData.rooms,
    reservations: hotelData.reservations,
    isLoading: hotelData.isLoading,
    error: hotelData.error,
    
    // Operaciones con contexto de usuario
    createGuest,
    updateGuest,
    deleteGuest,
    createRoom,
    updateRoom,
    deleteRoom,
    createReservation,
    updateReservation,
    deleteReservation,
  };
};
