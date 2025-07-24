
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useHotelDataWithContext } from '@/hooks/useHotelDataWithContext';
import { useReservationForm } from '@/hooks/useReservationForm';
import { ReservationFormFields } from './ReservationFormFields';
import { Reservation, Guest } from '@/types/hotel';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation;
  preSelectedRoomId?: string;
  preSelectedDates?: {
    checkIn: string;
    checkOut: string;
  };
}

export const ReservationModal = ({ 
  isOpen, 
  onClose, 
  reservation, 
  preSelectedRoomId,
  preSelectedDates 
}: ReservationModalProps) => {
  const [formData, setFormData] = useState({
    roomId: preSelectedRoomId || '',
    guestId: '',
    checkIn: preSelectedDates?.checkIn || '',
    checkOut: preSelectedDates?.checkOut || '',
    guestsCount: '1',
    totalAmount: '0',
    status: 'confirmed',
    specialRequests: '',
    createdBy: 'Admin',
  });

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(false);

  useEffect(() => {
    if (reservation) {
      setFormData({
        roomId: reservation.room_id,
        guestId: reservation.guest_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        guestsCount: reservation.guests_count.toString(),
        totalAmount: reservation.total_amount.toString(),
        status: reservation.status,
        specialRequests: reservation.special_requests || '',
        createdBy: reservation.created_by || 'Admin',
      });
    } else if (preSelectedRoomId && preSelectedDates) {
      setFormData(prev => ({
        ...prev,
        roomId: preSelectedRoomId,
        checkIn: preSelectedDates.checkIn,
        checkOut: preSelectedDates.checkOut,
      }));
    }
  }, [reservation, preSelectedRoomId, preSelectedDates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsNewGuest(false);
    setFormData(prev => ({
      ...prev,
      guestId: guest.id,
    }));
  };

  const handleNewGuestToggle = () => {
    setIsNewGuest(prev => !prev);
    setSelectedGuest(null);
    setFormData(prev => ({
      ...prev,
      guestId: '',
    }));
  };
  
  const { guests, rooms } = useHotelDataWithContext();
  const { submitReservation, isSubmitting } = useReservationForm();

  useEffect(() => {
    if (formData.guestId && !isNewGuest) {
      const guest = guests?.find(g => g.id === formData.guestId);
      setSelectedGuest(guest || null);
    } else {
      setSelectedGuest(null);
    }
  }, [formData.guestId, guests, isNewGuest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform formData to match the expected format
    const transformedFormData = {
      guest_id: formData.guestId,
      room_id: formData.roomId,
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      guests_count: parseInt(formData.guestsCount),
      status: formData.status,
      special_requests: formData.specialRequests,
      discount_percentage: selectedGuest?.discount_percentage || 0,
    };
    
    const result = await submitReservation(
      transformedFormData,
      selectedGuest,
      isNewGuest,
      reservation
    );

    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ReservationFormFields
            formData={formData}
            handleInputChange={handleInputChange}
            guests={guests || []}
            rooms={rooms || []}
            selectedGuest={selectedGuest}
            handleGuestSelect={handleGuestSelect}
            isNewGuest={isNewGuest}
            handleNewGuestToggle={handleNewGuestToggle}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
