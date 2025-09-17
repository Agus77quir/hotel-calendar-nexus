import { Guest, Room, Reservation } from '@/types/hotel';

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

export const generateConfirmationEmailTemplate = (
  guest: Guest,
  reservation: Reservation,
  room: Room
): { subject: string; body: string } => {
  const reservationNumber = generateSimpleId(reservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(reservation.check_in);
  const roomNumber = room.number.length === 1 ? `0${room.number}` : room.number;

  const subject = `Confirmación de Reserva - Hostería Anillaco - ${reservationNumber}`;
  
  const body = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Habitación: #${roomNumber}
• Huéspedes: ${reservation.guests_count}
• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  return { subject, body };
};

export const generateMultipleReservationEmailTemplate = (
  guest: Guest,
  reservations: Reservation[],
  rooms: Room[]
): { subject: string; body: string } => {
  const firstReservation = reservations[0];
  const reservationNumber = generateSimpleId(firstReservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(firstReservation.check_in);
  const departureDate = formatDate(firstReservation.check_out);
  
  console.log('=== DEBUGGING MULTIPLE RESERVATION EMAIL ===');
  console.log('Total email reservations:', reservations.length);
  console.log('Email reservation IDs:', reservations.map(r => r.id));
  console.log('Email room IDs from reservations:', reservations.map(r => r.room_id));
  console.log('Email available rooms:', rooms.map(r => ({ id: r.id, number: r.number })));
  
  // SOLUCIÓN DEFINITIVA: Crear array completo de números de habitación
  const roomDetails = [];
  
  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    console.log(`Processing email reservation ${i + 1}/${reservations.length}:`, {
      reservationId: reservation.id,
      roomId: reservation.room_id
    });
    
    // Buscar la habitación correspondiente a esta reserva
    const matchingRoom = rooms.find(room => room.id === reservation.room_id);
    
    if (matchingRoom) {
      const formattedNumber = matchingRoom.number.length === 1 ? `0${matchingRoom.number}` : matchingRoom.number;
      roomDetails.push(`#${formattedNumber}`);
      console.log(`✓ Found email room for reservation ${reservation.id}: #${formattedNumber}`);
    } else {
      console.error(`✗ NO EMAIL ROOM FOUND for reservation ${reservation.id} with room_id ${reservation.room_id}`);
      roomDetails.push(`#ERROR-${i + 1}`);
    }
  }

  const roomNumbersText = roomDetails.join(', ');
  console.log('Final email room details:', roomDetails);
  console.log('Email room numbers text:', roomNumbersText);

  const totalGuests = reservations.reduce((sum, res) => sum + res.guests_count, 0);

  const subject = `Confirmación de Reserva Múltiple - Hostería Anillaco - ${reservationNumber}`;
  
  const body = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva múltiple.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Fecha de salida: ${departureDate}
• Habitaciones: ${roomNumbersText}
• Huéspedes: ${totalGuests}
• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  console.log('FINAL EMAIL BODY:', body);

  return { subject, body };
};

export const openEmailClient = (
  guest: Guest,
  reservation: Reservation,
  room: Room
) => {
  const { subject, body } = generateConfirmationEmailTemplate(guest, reservation, room);
  
  // Sanitize: remove any monetary or payment related lines robustly
  const safeBody = body
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
  
  // Extra scrubbing to remove any remaining monetary fragments within allowed lines
  const safeBodyCleaned = safeBody
    .replace(/(\$|\b(?:ar\$|usd|eur|ars|u\$s)\b)\s*[\d.,]+/gi, '')
    .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[\d.,]+/gi, '')
    .replace(/\b(?:total(?:\s*general)?|precio|importe|tarifa|pago(?:s)?|saldo|anticipo|señ[aa]?)\b\s*:?\s*[\d.,]+[^\n]*/gim, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBodyCleaned)}`;
  
  // Clear any text selection to avoid clients including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  
  // Abrir cliente de email
  window.open(mailtoLink, '_blank');
};

export const openMultipleReservationEmailClient = (
  guest: Guest,
  reservations: Reservation[],
  rooms: Room[]
) => {
  const { subject, body } = generateMultipleReservationEmailTemplate(guest, reservations, rooms);
  
  // Sanitize: remove any monetary or payment related lines robustly
  const safeBody = body
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

  // Extra scrubbing to remove any remaining monetary fragments within allowed lines
  const safeBodyCleaned = safeBody
    .replace(/(\$|\b(?:ar\$|usd|eur|ars|u\$s)\b)\s*[\d.,]+/gi, '')
    .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[\d.,]+/gi, '')
    .replace(/\b(?:total(?:\s*general)?|precio|importe|tarifa|pago(?:s)?|saldo|anticipo|señ[aa]?)\b\s*:?\s*[\d.,]+[^\n]*/gim, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBodyCleaned)}`;

  // Clear any text selection to avoid clients including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  
  // Abrir cliente de email
  window.open(mailtoLink, '_blank');
};
