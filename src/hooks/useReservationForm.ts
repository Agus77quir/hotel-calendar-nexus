import { useState, useEffect } from 'react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { hasDateOverlap, validateReservationDates } from '@/utils/reservationValidation';
import { getTodayInBuenosAires, getTomorrowInBuenosAires, calculateDaysDifference, formatSelectedDateForBuenosAires } from '@/utils/dateUtils';

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

  // Usar fecha actual en timezone de Buenos Aires
  const today = getTodayInBuenosAires();

  // Auto-suggest check-out date (default to 1 night stay)
  const getDefaultCheckOut = (checkIn: string) => {
    if (!checkIn) return '';
    const [year, month, day] = checkIn.split('-').map(Number);
    const checkInDate = new Date(year, month - 1, day);
    checkInDate.setDate(checkInDate.getDate() + 1);
    
    const nextYear = checkInDate.getFullYear();
    const nextMonth = String(checkInDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(checkInDate.getDate()).padStart(2, '0');
    
    return `${nextYear}-${nextMonth}-${nextDay}`;
  };

  // Validate all required fields
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.guest_id) {
      errors.push('Debe seleccionar un huésped');
    }
    
    if (!formData.room_id) {
      errors.push('Debe seleccionar una habitación');
    }
    
    if (!formData.check_in) {
      errors.push('Debe seleccionar fecha de check-in');
    }
    
    if (!formData.check_out) {
      errors.push('Debe seleccionar fecha de check-out');
    }
    
    if (formData.guests_count < 1) {
      errors.push('Debe especificar al menos 1 huésped');
    }
    
    if (formData.check_in && formData.check_in < today) {
      errors.push('La fecha de check-in no puede ser anterior a hoy');
    }
    
    if (formData.check_in && formData.check_out && formData.check_out <= formData.check_in) {
      errors.push('La fecha de check-out debe ser posterior a la fecha de check-in');
    }
    
    if (formData.room_id && formData.check_in && formData.check_out) {
      const hasOverlap = hasDateOverlap(
        formData.room_id, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      if (hasOverlap) {
        errors.push('La habitación ya está reservada para estas fechas');
      }
    }
    
    if (selectedRoom && formData.guests_count > selectedRoom.capacity) {
      errors.push(`La habitación seleccionada tiene capacidad máxima de ${selectedRoom.capacity} huéspedes`);
    }
    
    return errors;
  };

  const isFormValid = () => {
    return validateForm().length === 0;
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
      // Usar fechas en timezone de Buenos Aires para nuevas reservas
      const defaultCheckIn = getTomorrowInBuenosAires();
      
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
      const suitableRoom = availableRooms.find(room => room.capacity >= formData.guests_count) || availableRooms[0];
      if (suitableRoom) {
        handleRoomChange(suitableRoom.id);
      }
    }
  }, [formData.check_in, formData.check_out, formData.guests_count, mode, availableRooms.length]);

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

  // Handle date changes with Buenos Aires timezone - FIXED
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    console.log(`Date change for ${field}:`, value, 'today:', today);
    
    if (field === 'check_in' && value < today) {
      setAvailabilityError('No se pueden hacer reservas para fechas anteriores a hoy');
      return;
    }

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      if (field === 'check_in' && mode === 'create' && !prev.check_out) {
        newFormData.check_out = getDefaultCheckOut(value);
      }
      
      if (newFormData.check_in && newFormData.check_out && newFormData.room_id) {
        const hasOverlap = hasDateOverlap(
          newFormData.room_id, 
          newFormData.check_in, 
          newFormData.check_out, 
          reservations,
          reservation?.id
        );
        if (hasOverlap) {
          newFormData.room_id = '';
        }
      }
      
      return newFormData;
    });
    
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

  // Calculate total with proper date handling
  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    
    if (!selectedRoom || !formData.check_in || !formData.check_out) return { subtotal: 0, discount: 0, total: 0 };
    
    const nights = calculateDaysDifference(formData.check_in, formData.check_out);
    
    const subtotal = selectedRoom.price * nights;
    const discountAmount = formData.discount_percentage > 0 ? (subtotal * formData.discount_percentage) / 100 : 0;
    const total = subtotal - discountAmount;
    
    console.log('Calculate total - nights:', nights, 'subtotal:', subtotal, 'discount%:', formData.discount_percentage, 'discountAmount:', discountAmount, 'total:', total);
    
    return {
      subtotal,
      discount: discountAmount,
      total
    };
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
    validateDates,
    validateForm,
    isFormValid
  };
};
