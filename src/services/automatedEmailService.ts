
import { Guest, Room, Reservation } from '@/types/hotel';
import { sendAutomaticEmail } from './emailService';

const generateSimpleId = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

const formatDate = (dateString: string): string => {
  // Parse the date string directly without adding time component
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const sendReservationConfirmationAutomatically = async (
  guest: Guest,
  reservation: Reservation,
  room: Room
): Promise<boolean> => {
  try {
    const reservationNumber = generateSimpleId(reservation.id);
    const guestName = `${guest.first_name} ${guest.last_name}`;
    const arrivalDate = formatDate(reservation.check_in);

    const subject = `Confirmación de Reserva - Hostería Anillaco - ${reservationNumber}`;
    
    const message = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Tipo de habitación: ${room.type}
• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

    const emailData = {
      to_email: guest.email,
      to_name: guestName,
      subject,
      message,
      reservation_number: reservationNumber,
      hotel_name: 'Hostería Anillaco',
      check_in: arrivalDate,
      check_out: '',
      room_type: room.type,
      room_number: room.number
    };

    const success = await sendAutomaticEmail(emailData);
    
    if (success) {
      console.log(`Email de confirmación enviado automáticamente a ${guest.email}`);
      return true;
    } else {
      console.error('No se pudo enviar el email automáticamente');
      return false;
    }
    
  } catch (error) {
    console.error('Error enviando email de confirmación automática:', error);
    return false;
  }
};
