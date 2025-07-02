
import { useState, useEffect } from 'react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { hasDateOverlap, validateReservationDates } from '@/utils/reservationValidation';

interface UseReservationFormProps {
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  reservation?: Reservation;
  mode: 'create' | 'edit';
  isOpen: boolean;
}

export const useReservationForm = ({
  rooms,
  guests,
  reservations,
  reservation,
  mode,
  isOpen
}: UseReservationFormProps) => {
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    guests_count: 1,
    status: 'confirmed' as 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled',
    special_requests: '',
  });

  const [availabilityError, setAvailabilityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date for validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (reservation && mode === 'edit') {
      setFormData({
        guest_id: reservation.guest_id,
        room_id: reservation.room_id,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        guests_count: reservation.guests_count,
        status: reservation.status,
        special_requests: reservation.special_requests || '',
      });
    } else {
      setFormData({
        guest_id: '',
        room_id: '',
        check_in: '',
        check_out: '',
        guests_count: 1,
        status: 'confirmed',
        special_requests: '',
      });
    }
    setAvailabilityError('');
  }, [reservation, mode, isOpen]);

  // Get selected room details
  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  const maxCapacity = selectedRoom ? selectedRoom.capacity : 1;

  // Get selected guest details
  const selectedGuest = guests.find(g => g.id === formData.guest_id);

  // Filter available rooms based on dates and existing reservations
  const getAvailableRooms = () => {
    // If no dates selected, show only rooms with 'available' status
    if (!formData.check_in || !formData.check_out) {
      return rooms.filter(room => room.status === 'available');
    }

    return rooms.filter(room => {
      // Room must be available
      if (room.status !== 'available') {
        return false;
      }

      // Check if room has any overlapping reservations for the selected dates
      const hasOverlap = hasDateOverlap(
        room.id, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      
      console.log('Room', room.number, 'has overlap:', hasOverlap);
      
      return !hasOverlap;
    });
  };

  const availableRooms = getAvailableRooms();

  // Handle room change - adjust guest count if it exceeds new room capacity
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const newMaxCapacity = room ? room.capacity : 1;
    
    // Check if selected room has overlap
    if (formData.check_in && formData.check_out) {
      const hasOverlap = hasDateOverlap(
        roomId, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      if (hasOverlap) {
        setAvailabilityError('Habitación ya reservada, elija otra');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      room_id: roomId,
      guests_count: prev.guests_count > newMaxCapacity ? newMaxCapacity : prev.guests_count
    }));
    
    // Clear availability error when room changes
    setAvailabilityError('');
  };

  // Handle date changes - reset room selection and clear errors
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    // Validate that date is not before today
    if (value < today) {
      setAvailabilityError('No se pueden hacer reservas para fechas anteriores a hoy');
      return;
    }

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      // If we have both dates and a selected room, check for overlap
      if (newFormData.check_in && newFormData.check_out && newFormData.room_id) {
        const hasOverlap = hasDateOverlap(
          newFormData.room_id, 
          newFormData.check_in, 
          newFormData.check_out, 
          reservations,
          reservation?.id
        );
        if (hasOverlap) {
          // Clear room selection if it now has overlap
          newFormData.room_id = '';
        }
      }
      
      return newFormData;
    });
    
    setAvailabilityError('');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    const selectedGuest = guests.find(g => g.id === formData.guest_id);
    
    if (!selectedRoom || !formData.check_in || !formData.check_out) return 0;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = selectedRoom.price * nights;
    
    // Apply discount if guest is associated
    if (selectedGuest?.is_associated && selectedGuest.discount_percentage > 0) {
      const discountAmount = (subtotal * selectedGuest.discount_percentage) / 100;
      return subtotal - discountAmount;
    }
    
    return subtotal;
  };

  const validateDates = () => {
    return validateReservationDates(formData.check_in, formData.check_out, today);
  };

  return {
    formData,
    availabilityError,
    isSubmitting,
    today,
    selectedRoom,
    selectedGuest,
    maxCapacity,
    availableRooms,
    setAvailabilityError,
    setIsSubmitting,
    handleRoomChange,
    handleDateChange,
    handleFormChange,
    calculateTotal,
    validateDates
  };
};
