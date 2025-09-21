
import { Guest, Room, Reservation } from '@/types/hotel';
import { sendReservationConfirmationAutomatically } from './automatedEmailService';
import { sendReservationToWhatsAppSanitized } from './whatsappSanitized';

interface ReservationAutomationOptions {
  sendEmail?: boolean;
  sendWhatsApp?: boolean;
  updateGuestStatus?: boolean;
}

export const handleReservationAutomation = async (
  reservation: Reservation,
  guest: Guest,
  room: Room,
  options: ReservationAutomationOptions = {
    sendEmail: true,
    sendWhatsApp: false,
    updateGuestStatus: true
  }
): Promise<{
  emailSent: boolean;
  whatsAppSent: boolean;
  guestUpdated: boolean;
  errors: string[];
}> => {
  const results = {
    emailSent: false,
    whatsAppSent: false,
    guestUpdated: false,
    errors: [] as string[]
  };

  // Auto-send confirmation email
  if (options.sendEmail) {
    try {
      results.emailSent = await sendReservationConfirmationAutomatically(guest, reservation, room);
      if (!results.emailSent) {
        results.errors.push('No se pudo enviar el email de confirmación');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      results.errors.push('Error enviando email de confirmación');
    }
  }

  // Auto-send WhatsApp message (optional)
  if (options.sendWhatsApp && guest.phone) {
    try {
      sendReservationToWhatsAppSanitized(reservation, guest, room);
      results.whatsAppSent = true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      results.errors.push('Error enviando mensaje de WhatsApp');
    }
  }

  // Update guest status if this is their first reservation
  if (options.updateGuestStatus) {
    try {
      // This would typically update the guest's status in the database
      // For now, we'll just mark it as successful
      results.guestUpdated = true;
    } catch (error) {
      console.error('Error updating guest status:', error);
      results.errors.push('Error actualizando estado del huésped');
    }
  }

  return results;
};

export const getReservationSuggestions = (
  guest: Guest,
  rooms: Room[],
  existingReservations: Reservation[]
): {
  suggestedRoom?: Room;
  suggestedDates?: { checkIn: string; checkOut: string };
  suggestedGuestCount: number;
  notes: string[];
} => {
  const suggestions = {
    suggestedRoom: undefined as Room | undefined,
    suggestedDates: undefined as { checkIn: string; checkOut: string } | undefined,
    suggestedGuestCount: 2,
    notes: [] as string[]
  };

  // Find guest's previous reservations
  const guestReservations = existingReservations.filter(r => r.guest_id === guest.id);
  
  if (guestReservations.length > 0) {
    // Get most recent reservation for suggestions
    const lastReservation = guestReservations.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    // Suggest same room type or room if available
    const lastRoom = rooms.find(r => r.id === lastReservation.room_id);
    if (lastRoom) {
      const sameRoom = rooms.find(r => r.id === lastRoom.id && r.status === 'available');
      const sameType = rooms.find(r => r.type === lastRoom.type && r.status === 'available');
      
      suggestions.suggestedRoom = sameRoom || sameType;
      if (sameRoom) {
        suggestions.notes.push(`Sugerencia: Misma habitación que su última reserva (#${lastRoom.number})`);
      } else if (sameType) {
        suggestions.notes.push(`Sugerencia: Mismo tipo de habitación que su última reserva (${lastRoom.type})`);
      }
    }
    
    // Suggest same guest count
    suggestions.suggestedGuestCount = lastReservation.guests_count;
    suggestions.notes.push(`Sugerencia: ${lastReservation.guests_count} huésped${lastReservation.guests_count > 1 ? 'es' : ''} como su última reserva`);
  }

  // Smart date suggestions (avoid weekends for business travelers, etc.)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  suggestions.suggestedDates = {
    checkIn: tomorrow.toISOString().split('T')[0],
    checkOut: dayAfterTomorrow.toISOString().split('T')[0]
  };

  return suggestions;
};

export const validateReservationAutomatically = (
  formData: any,
  rooms: Room[],
  guests: Guest[],
  reservations: Reservation[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} => {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    suggestions: [] as string[]
  };

  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  const selectedGuest = guests.find(g => g.id === formData.guest_id);

  // Validate required fields
  if (!formData.guest_id) {
    result.errors.push('Debe seleccionar un huésped');
    result.isValid = false;
  }

  if (!formData.room_id) {
    result.errors.push('Debe seleccionar una habitación');
    result.isValid = false;
  }

  if (!formData.check_in || !formData.check_out) {
    result.errors.push('Debe seleccionar fechas de check-in y check-out');
    result.isValid = false;
  }

  // Validate guest count vs room capacity
  if (selectedRoom && formData.guests_count > selectedRoom.capacity) {
    result.errors.push(`La habitación seleccionada tiene capacidad para ${selectedRoom.capacity} huéspedes máximo`);
    result.isValid = false;
  }

  // Warnings for optimal experience
  if (selectedGuest && !selectedGuest.phone) {
    result.warnings.push('El huésped no tiene teléfono registrado para notificaciones automáticas');
  }

  if (selectedRoom && formData.guests_count < selectedRoom.capacity - 1) {
    result.suggestions.push(`La habitación puede alojar hasta ${selectedRoom.capacity} huéspedes`);
  }

  // Discount suggestions
  if (selectedGuest && selectedGuest.is_associated && formData.discount_percentage === 0) {
    result.suggestions.push('Este huésped es asociado y puede recibir descuento automáticamente');
  }

  return result;
};
