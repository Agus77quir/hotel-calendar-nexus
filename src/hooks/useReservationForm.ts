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
    is_associated: false,
    discount_percentage: 0,
  });

  const [availabilityError, setAvailabilityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date for validation
  const today = new Date().toISOString().split('T')[0];

  // Auto-suggest check-out date (default to 1 night stay)
  const getDefaultCheckOut = (checkIn: string) => {
    if (!checkIn) return '';
    const checkInDate = new Date(checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    return checkInDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (reservation && mode === 'edit') {
      // For existing reservations, get associated status from guest data
      const guest = guests.find(g => g.id === reservation.guest_id);
      setFormData({
        guest_id: reservation.guest_id,
        room_id: reservation.room_id,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        guests_count: reservation.guests_count,
        status: reservation.status,
        special_requests: reservation.special_requests || '',
        is_associated: guest?.is_associated || false,
        discount_percentage: 0,
      });
    } else {
      // For new reservations, set smart defaults
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultCheckIn = tomorrow.toISOString().split('T')[0];
      
      setFormData({
        guest_id: '',
        room_id: '',
        check_in: defaultCheckIn,
        check_out: getDefaultCheckOut(defaultCheckIn),
        guests_count: 2,
        status: 'confirmed',
        special_requests: '',
        is_associated: false,
        discount_percentage: 0,
      });
    }
    setAvailabilityError('');
  }, [reservation, mode, isOpen, guests]);

  // Auto-activate association when associated guest is selected
  useEffect(() => {
    if (formData.guest_id && mode === 'create') {
      const selectedGuest = guests.find(g => g.id === formData.guest_id);
      if (selectedGuest?.is_associated && !formData.is_associated) {
        console.log('Auto-activating association for guest:', selectedGuest.first_name, selectedGuest.last_name);
        setFormData(prev => ({
          ...prev,
          is_associated: true,
          discount_percentage: selectedGuest.discount_percentage || 10 // Default to 10% if guest has no default
        }));
      } else if (!selectedGuest?.is_associated && formData.is_associated) {
        // Reset association if switching to non-associated guest
        console.log('Resetting association for non-associated guest');
        setFormData(prev => ({
          ...prev,
          is_associated: false,
          discount_percentage: 0
        }));
      }
    }
  }, [formData.guest_id, guests, mode]);

  // Get selected room details
  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  const maxCapacity = selectedRoom ? selectedRoom.capacity : 1;

  // Get selected guest details
  const selectedGuest = guests.find(g => g.id === formData.guest_id);

  // Auto-suggest best available room when dates change
  const getBestAvailableRoom = () => {
    if (!formData.check_in || !formData.check_out) {
      return rooms.filter(room => room.status === 'available');
    }

    const availableRooms = rooms.filter(room => {
      if (room.status !== 'available') return false;

      const hasOverlap = hasDateOverlap(
        room.id, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      
      return !hasOverlap;
    });

    // Sort by capacity (smallest first) then by price (lowest first) for smart suggestions
    return availableRooms.sort((a, b) => {
      if (a.capacity !== b.capacity) {
        return a.capacity - b.capacity;
      }
      return a.price - b.price;
    });
  };

  const availableRooms = getBestAvailableRoom();

  // Auto-select best room when dates are set and no room is selected
  useEffect(() => {
    if (mode === 'create' && !formData.room_id && formData.check_in && formData.check_out && availableRooms.length > 0) {
      // Auto-select the first available room that fits the guest count
      const suitableRoom = availableRooms.find(room => room.capacity >= formData.guests_count) || availableRooms[0];
      if (suitableRoom) {
        handleRoomChange(suitableRoom.id);
      }
    }
  }, [formData.check_in, formData.check_out, formData.guests_count, mode, availableRooms.length]);

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

  // Handle date changes - auto-suggest checkout and reset room selection
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    // Validate that date is not before today (except for check_out)
    if (field === 'check_in' && value < today) {
      setAvailabilityError('No se pueden hacer reservas para fechas anteriores a hoy');
      return;
    }

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      // Auto-set checkout date when checkin changes (for new reservations)
      if (field === 'check_in' && mode === 'create' && !prev.check_out) {
        newFormData.check_out = getDefaultCheckOut(value);
      }
      
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

  // Simple form change handler - Fixed to handle boolean values properly
  const handleFormChange = (field: string, value: any) => {
    console.log(`Form field changed: ${field} =`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    
    if (!selectedRoom || !formData.check_in || !formData.check_out) return 0;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    let baseTotal = selectedRoom.price * nights;
    
    // Apply discount if associated guest
    if (formData.is_associated && formData.discount_percentage > 0) {
      const discountAmount = (baseTotal * formData.discount_percentage) / 100;
      baseTotal = baseTotal - discountAmount;
    }
    
    return baseTotal;
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
