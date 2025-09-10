
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

    const safeBody = message
      .split('\n')
      .filter((line) => {
        const l = line.toLowerCase();
        if (l.includes('$') || /(\bar\$|\busd\b|\beur\b|\bars\b|u\$s)/i.test(l)) return false;
        if (/(pesos?|dólares?|euros?)/i.test(l) && /[\d.,]/.test(l)) return false;
        if (/(monto\s*total|total\s*a\s*a?pagar|total\s*general|total\s*:|precio|importe|tarifa|pago|pagos|seña|señal|anticipo|saldo)/i.test(l) && /[\d.,]/.test(l)) return false;
        if (l.includes('total') && /\d/.test(l) && !/(huésped|huesped)/i.test(l)) return false;
        return true;
      })
      .join('\n');

    const safeBodyCleaned = safeBody
      .replace(/(\$|\b(?:ar\$|usd|eur|ars|u\$s)\b)\s*[\d.,]+/gi, '')
      .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[\d.,]+/gi, '')
      .replace(/\b(?:total(?:\s*general)?|precio|importe|tarifa|pago(?:s)?|saldo|anticipo|señ[aa]?)\b\s*:?\s*[\d.,]+[^\n]*/gim, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const emailData = {
      to_email: guest.email,
      to_name: guestName,
      subject,
      message: safeBodyCleaned,
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
