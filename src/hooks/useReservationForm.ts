
import { useState, useEffect, useMemo } from 'react';
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
      setFormData({
        guest_id: reservation.guest_id,
        room_id: reservation.room_id,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        guests_count: reservation.guests_count,
        status: reservation.status,
        special_requests: reservation.special_requests || '',
        discount_percentage: 0, // Reset discount for edit mode
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultCheckIn = tomorrow.toISOString().split('T')[0];
      
      setFormData({
        guest_id: '',
        room_id: '',
        check_in: defaultCheckIn,
        check_out: getDefaultCheckOut(defaultCheckIn),
        guests_count: 1,
        status: 'confirmed',
        special_requests: '',
        discount_percentage: 0,
      });
    }
    setAvailabilityError('');
  }, [reservation, mode, isOpen, guests]);

  // Get selected room details
  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  const maxCapacity = selectedRoom ? selectedRoom.capacity : 1;

  // Get selected guest details
  const selectedGuest = guests.find(g => g.id === formData.guest_id);

  // Calculate available rooms using useMemo to prevent recalculation loops
  const availableRooms = useMemo(() => {
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

    return availableRooms.sort((a, b) => {
      if (a.capacity !== b.capacity) {
        return a.capacity - b.capacity;
      }
      return a.price - b.price;
    });
  }, [rooms, formData.check_in, formData.check_out, reservations, reservation?.id]);

  // Auto-select best room when dates are set and no room is selected
  useEffect(() => {
    if (mode === 'create' && !formData.room_id && formData.check_in && formData.check_out && availableRooms.length > 0) {
      const suitableRoom = availableRooms.find(room => room.capacity >= formData.guests_count) || availableRooms[0];
      if (suitableRoom) {
        setFormData(prev => ({ ...prev, room_id: suitableRoom.id }));
      }
    }
  }, [formData.check_in, formData.check_out, formData.guests_count, mode, availableRooms]);

  // Handle room change and adjust guest count if necessary
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const newMaxCapacity = room ? room.capacity : 1;
    
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
      // Only adjust guest count if it exceeds the new room capacity
      guests_count: prev.guests_count > newMaxCapacity ? newMaxCapacity : prev.guests_count
    }));
    
    setAvailabilityError('');
  };

  // Handle date changes - SIMPLIFIED to prevent re-renders
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    console.log(`Date change: ${field} = ${value}`);
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      // Auto-suggest check-out when check-in changes and we're creating a new reservation
      if (field === 'check_in' && mode === 'create' && !prev.check_out) {
        newFormData.check_out = getDefaultCheckOut(value);
      }
      
      return newFormData;
    });
    
    // Clear availability error when dates change
    setAvailabilityError('');
  };

  // Simple form change handler - NO MORE AUTOMATIC CHANGES
  const handleFormChange = (field: string, value: any) => {
    console.log(`Form field changed: ${field} =`, value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate total with discount
  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    
    if (!selectedRoom || !formData.check_in || !formData.check_out) return { subtotal: 0, discount: 0, total: 0 };
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const subtotal = selectedRoom.price * nights;
    const discountAmount = formData.discount_percentage > 0 ? (subtotal * formData.discount_percentage) / 100 : 0;
    const total = subtotal - discountAmount;
    
    console.log('Calculate total - subtotal:', subtotal, 'discount%:', formData.discount_percentage, 'discountAmount:', discountAmount, 'total:', total);
    
    return {
      subtotal,
      discount: discountAmount,
      total
    };
  };

  const validateDates = () => {
    const validation = validateReservationDates(formData.check_in, formData.check_out, today);
    if (!validation.isValid) {
      setAvailabilityError(validation.error || '');
      return false;
    }
    return true;
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
