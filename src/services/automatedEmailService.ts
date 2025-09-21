
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
• Habitación: ${room.number}
• Huéspedes: ${reservation.guests_count}
• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

    const lines = message.split('\n');
    const isGuestCountLine = (line: string) => {
      const lnorm = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return /(huespedes?|hu(e|é)sped(?:es)?)/.test(lnorm) && /\d/.test(lnorm);
    };

    const filtered = lines.filter((line) => {
      const l = line.toLowerCase();
      const lnorm = l.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/[€$£]/.test(line)) return false;
      if (/(?:\bar\$|\bu\$s\b|\busd\b|\beur\b|\bars\b|\bclp\b|\bmxn\b)/i.test(lnorm)) return false;
      if (/\b(pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b/i.test(lnorm) && /[0-9.,]/.test(line)) return false;
      if (/\b(monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|senal|señal|anticipo|saldo|balance|restante|resto|costo|coste)\b/i.test(lnorm)) return false;
      if (/\btotal\b/i.test(line) && !isGuestCountLine(line)) return false;
      return true;
    });

    const safeBodyFinal = filtered
      .join('\n')
      .replace(/(?:[$€£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/\b(?:pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/^\s*[•-]?\s*(?:monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|senal|anticipo|saldo|balance|restante|resto|costo|coste|total).*$/gim, '')
      .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const emailData = {
      to_email: guest.email,
      to_name: guestName,
      subject,
      message: safeBodyFinal,
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
