
import { useState, useCallback } from 'react';
import { useHotelDataWithContext } from './useHotelDataWithContext';
import { toast } from './use-toast';
import { Reservation, Guest } from '@/types/hotel';
import { formatDateForDatabase, parseDate } from '@/utils/dateUtils';

export const useReservationForm = () => {
  const { createReservation, updateReservation, createGuest, updateGuest } = useHotelDataWithContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReservation = useCallback(async (
    reservationData: any,
    guestData: any,
    isNewGuest: boolean,
    editingReservation?: Reservation
  ) => {
    setIsSubmitting(true);
    
    try {
      let guestId = guestData.id;
      
      // Crear o actualizar huésped
      if (isNewGuest) {
        const newGuest = await createGuest({
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          document: guestData.document,
          nationality: guestData.nationality,
          isAssociated: guestData.isAssociated || false,
          discountPercentage: guestData.discountPercentage || 0,
        });
        guestId = newGuest.id;
      } else if (guestData.id) {
        // Actualizar huésped existente si hay cambios
        await updateGuest(guestData.id, {
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          email: guestData.email,
          phone: guestData.phone,
          document: guestData.document,
          nationality: guestData.nationality,
          isAssociated: guestData.isAssociated || false,
          discountPercentage: guestData.discountPercentage || 0,
        });
      }

      // Preparar datos de reserva
      const reservationPayload = {
        guestId,
        roomId: reservationData.roomId,
        checkIn: formatDateForDatabase(parseDate(reservationData.checkIn)),
        checkOut: formatDateForDatabase(parseDate(reservationData.checkOut)),
        guestsCount: parseInt(reservationData.guestsCount),
        totalAmount: parseFloat(reservationData.totalAmount),
        status: reservationData.status,
        specialRequests: reservationData.specialRequests || '',
        createdBy: reservationData.createdBy,
      };

      // Crear o actualizar reserva
      if (editingReservation) {
        await updateReservation(editingReservation.id, reservationPayload);
        toast({
          title: "Reserva actualizada",
          description: "La reserva ha sido actualizada exitosamente",
        });
      } else {
        await createReservation(reservationPayload);
        toast({
          title: "Reserva creada",
          description: "La reserva ha sido creada exitosamente",
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la reserva",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [createReservation, updateReservation, createGuest, updateGuest]);

  return {
    submitReservation,
    isSubmitting,
  };
};
