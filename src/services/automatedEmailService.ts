
import { Guest, Room, Reservation } from '@/types/hotel';
import { sendAutomaticEmail } from './emailService';

const generateSimpleId = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
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
    const departureDate = formatDate(reservation.check_out);

    const subject = `Confirmación de Reserva - Hotel Nardini S.R.L - ${reservationNumber}`;
    
    const message = `Estimado/a ${guestName},

¡Gracias por elegir Hotel Nardini S.R.L! Nos complace confirmar su reserva.

📋 DETALLES DE SU RESERVA:
• Número de Reserva: ${reservationNumber}
• Hotel: Hotel Nardini S.R.L
• Fecha de Llegada: ${arrivalDate}
• Fecha de Salida: ${departureDate}
• Tipo de Habitación: Habitación #${room.number} - ${room.type}
• Número de Huéspedes: ${reservation.guests_count || 2}

🏨 INFORMACIÓN IMPORTANTE:
• Check-in: A partir de las 15:00 horas
• Check-out: Hasta las 12:00 horas
• Políticas de Cancelación: Cancelación gratuita hasta 24 horas antes de la llegada

🎁 SERVICIOS INCLUIDOS:
• Desayuno incluido
• WiFi gratuito
• Acceso a la piscina

📝 INSTRUCCIONES ESPECIALES:
Por favor, presente un documento de identidad válido al momento del check-in

Estamos emocionados de recibirle y hacer que su estadía sea memorable.

¡Esperamos verle pronto!

Saludos cordiales,
Equipo de Hotel Nardini S.R.L

---
Este es un correo de confirmación automática.`;

    const emailData = {
      to_email: guest.email,
      to_name: guestName,
      subject,
      message,
      reservation_number: reservationNumber,
      hotel_name: 'Hotel Nardini S.R.L',
      check_in: arrivalDate,
      check_out: departureDate,
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
