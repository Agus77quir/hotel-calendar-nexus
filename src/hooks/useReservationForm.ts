
import { useState, useEffect } from 'react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { hasDateOverlap, validateReservationDates } from '@/utils/reservationValidation';
import { getTodayInBuenosAires, getTomorrowInBuenosAires, calculateDaysDifference, formatSelectedDateForBuenosAires } from '@/utils/dateUtils';
import { calculateRoomPrice } from '@/utils/pricingUtils';

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

  const { toast } = useToast();

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

  // Validate all required fields - ENHANCED VALIDATION
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
    
    // ENHANCED: Critical room availability check
    if (formData.room_id && formData.check_in && formData.check_out) {
      const hasOverlap = hasDateOverlap(
        formData.room_id, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      if (hasOverlap) {
        const room = rooms.find(r => r.id === formData.room_id);
        const roomNumber = room?.number || formData.room_id;
        errors.push(`La habitación ${roomNumber} ya está reservada para estas fechas. Seleccione otra habitación disponible.`);
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
        guests_count: 1, // Se actualizará cuando se seleccione una habitación
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

  // Handle room change and set guest count to maximum capacity - ENHANCED
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const newMaxCapacity = room ? room.capacity : 1;
    
    // ENHANCED: Strict date overlap validation before allowing room selection
    if (formData.check_in && formData.check_out) {
      const hasOverlap = hasDateOverlap(
        roomId, 
        formData.check_in, 
        formData.check_out, 
        reservations,
        reservation?.id
      );
      if (hasOverlap) {
        const roomNumber = room?.number || roomId;
        const errorMsg = `La habitación ${roomNumber} ya está reservada para ${formData.check_in} a ${formData.check_out}.`;
        setAvailabilityError(errorMsg);
        toast({
          title: 'Habitación no disponible',
          description: errorMsg,
          variant: 'destructive',
        });
        console.error('Room overlap detected:', errorMsg);
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      room_id: roomId,
      // ALWAYS set guest count to maximum capacity when room is selected
      guests_count: newMaxCapacity
    }));
    
    setAvailabilityError('');
    console.log('Room selected successfully:', roomId, 'capacity:', newMaxCapacity);
  };

  // Handle date changes - CORREGIDO para mantener fechas exactas
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    console.log(`Date change for ${field}:`, value, 'today:', today);
    
    // Validar solo si es check_in y la fecha es realmente anterior (no igual)
    if (field === 'check_in' && value && value < today) {
      setAvailabilityError('La fecha de check-in no puede ser anterior a hoy');
      return;
    }

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      
      // Auto-suggest checkout date only for new reservations and when no checkout is set
      if (field === 'check_in' && mode === 'create' && !prev.check_out) {
        newFormData.check_out = getDefaultCheckOut(value);
      }
      
      // Clear room selection if dates conflict
      if (newFormData.check_in && newFormData.check_out && newFormData.room_id) {
        const hasOverlap = hasDateOverlap(
          newFormData.room_id, 
          newFormData.check_in, 
          newFormData.check_out, 
          reservations,
          reservation?.id
        );
        if (hasOverlap) {
          const room = rooms.find(r => r.id === newFormData.room_id);
          const roomNumber = room?.number || newFormData.room_id;
          newFormData.room_id = '';
          newFormData.guests_count = 1; // Reset to default when room is cleared
          toast({
            title: 'Habitación no disponible',
            description: `La habitación ${roomNumber} no está disponible para las nuevas fechas seleccionadas. Por favor elija otra.`,
          });
        }
      }
      
      return newFormData;
    });
    
    setAvailabilityError('');
  };

  // Simple form change handler
  const handleFormChange = (field: string, value: any) => {
    console.log(`Form field changed: ${field} =`, value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate total with proper date handling and single occupancy pricing
  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    
    if (!selectedRoom || !formData.check_in || !formData.check_out) return { subtotal: 0, discount: 0, total: 0 };
    
    const nights = calculateDaysDifference(formData.check_in, formData.check_out);
    
    // Usar la nueva función de cálculo de precios
    const roomPrice = calculateRoomPrice(selectedRoom, formData.guests_count);
    
    const subtotal = roomPrice * nights;
    const discountAmount = formData.discount_percentage > 0 ? (subtotal * formData.discount_percentage) / 100 : 0;
    const total = subtotal - discountAmount;
    
    console.log('Calculate total - nights:', nights, 'guests:', formData.guests_count, 'roomPrice:', roomPrice, 'subtotal:', subtotal, 'discount%:', formData.discount_percentage, 'discountAmount:', discountAmount, 'total:', total);
    
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
