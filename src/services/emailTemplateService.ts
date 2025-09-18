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
  const lines = body.split('\n');
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

  const safeBodyIntermediate = filtered
    .join('\n')
    .replace(/(?:[$€£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
    .replace(/\b(?:pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
    .replace(/^\s*[•-]?\s*(?:monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|senal|anticipo|saldo|balance|restante|resto|costo|coste|total).*$/gim, '')
    .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const safeBodyFinal = safeBodyIntermediate
    .split('\n')
    .filter((line) => {
      const lnorm = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/[€$£]/.test(line)) return false;
      if (/\b(total|monto|importe|precio|tarifa|pago|pagos|pagado|abonado|senal|seña|anticipo|saldo|costo|coste)\b/i.test(lnorm) && !/\bhuesped(?:es)?\b/.test(lnorm)) return false;
      if (/\btotal\b/i.test(line) && !isGuestCountLine(line)) return false;
      return true;
    })
    .join('\n');

  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBodyFinal)}`;

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
  const lines = body.split('\n');
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

  const safeBodyIntermediate = filtered
    .join('\n')
    .replace(/(?:[$€£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
    .replace(/\b(?:pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
    .replace(/^\s*[•-]?\s*(?:monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|senal|anticipo|saldo|balance|restante|resto|costo|coste|total).*$/gim, '')
    .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const safeBodyFinal = safeBodyIntermediate
    .split('\n')
    .filter((line) => {
      const lnorm = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (/[€$£]/.test(line)) return false;
      if (/\b(total|monto|importe|precio|tarifa|pago|pagos|pagado|abonado|senal|seña|anticipo|saldo|costo|coste)\b/i.test(lnorm) && !/\bhuesped(?:es)?\b/.test(lnorm)) return false;
      if (/\btotal\b/i.test(line) && !isGuestCountLine(line)) return false;
      return true;
    })
    .join('\n');
  
  // Ultra-strict final pass for any residual phrases like 'monto total' or 'total: $...'
  const safeBodyUltimate = safeBodyFinal
    .replace(/^.*\bmonto\s*total\b.*$/gim, '')
    .replace(/\b(?:monto\s*)?total\b\s*[:\-]?\s*(?:[€$£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)?\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
    .replace(/^.*\btotal\b.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBodyUltimate)}`;

  // Clear any text selection to avoid clients including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  
  // Abrir cliente de email
  window.open(mailtoLink, '_blank');
};
