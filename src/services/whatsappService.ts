
import { Reservation, Guest, Room } from '@/types/hotel';

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

export const sendReservationToWhatsApp = (
  reservation: Reservation,
  guest: Guest,
  room: Room
) => {
  const reservationNumber = generateSimpleId(reservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(reservation.check_in);
  const roomNumber = room.number.length === 1 ? `0${room.number}` : room.number;
  
  const message = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Tipo de habitación: ${room.type}
• 1 Habitación
#${roomNumber}
• ${reservation.guests_count} huéspedes total
• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  // Crear enlace de WhatsApp
  const cleanMessage = message
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

  const sanitizedMessage = cleanMessage
    .replace(/(\$|\b(?:ar\$|usd|eur|ars|u\$s)\b)\s*[\d.,]+/gi, '')
    .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[\d.,]+/gi, '')
    .replace(/\b(?:total(?:\s*general)?|precio|importe|tarifa|pago(?:s)?|saldo|anticipo|señ[aa]?)\b\s*:?\s*[\d.,]+[^\n]*/gim, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const whatsappLink = `https://wa.me/${guest.phone}?text=${encodeURIComponent(sanitizedMessage)}`;
  
  // Clear any text selection to avoid OS/app including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  // Abrir WhatsApp
  window.open(whatsappLink, '_blank');
};

export const sendMultipleReservationToWhatsApp = (
  reservations: Reservation[],
  guest: Guest,
  rooms: Room[]
) => {
  const firstReservation = reservations[0];
  const reservationNumber = generateSimpleId(firstReservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(firstReservation.check_in);
  const departureDate = formatDate(firstReservation.check_out);
  
  console.log('=== DEBUGGING MULTIPLE RESERVATION WHATSAPP ===');
  console.log('Total reservations:', reservations.length);
  console.log('Reservation IDs:', reservations.map(r => r.id));
  console.log('Room IDs from reservations:', reservations.map(r => r.room_id));
  console.log('Available rooms:', rooms.map(r => ({ id: r.id, number: r.number })));
  
  // SOLUCIÓN DEFINITIVA: Crear array completo de números de habitación
  const roomDetails = [];
  
  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    console.log(`Processing reservation ${i + 1}/${reservations.length}:`, {
      reservationId: reservation.id,
      roomId: reservation.room_id
    });
    
    // Buscar la habitación correspondiente a esta reserva
    const matchingRoom = rooms.find(room => room.id === reservation.room_id);
    
    if (matchingRoom) {
      const formattedNumber = matchingRoom.number.length === 1 ? `0${matchingRoom.number}` : matchingRoom.number;
      roomDetails.push(`#${formattedNumber}`);
      console.log(`✓ Found room for reservation ${reservation.id}: #${formattedNumber}`);
    } else {
      console.error(`✗ NO ROOM FOUND for reservation ${reservation.id} with room_id ${reservation.room_id}`);
      roomDetails.push(`#ERROR-${i + 1}`);
    }
  }

  const roomNumbersText = roomDetails.join(', ');
  console.log('Final room details:', roomDetails);
  console.log('Room numbers text:', roomNumbersText);

  const totalGuests = reservations.reduce((sum, res) => sum + res.guests_count, 0);
  
  const message = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva múltiple.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Fecha de salida: ${departureDate}
• ${reservations.length} Habitaciones: ${roomNumbersText}
• ${totalGuests} huéspedes total

• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  console.log('FINAL MESSAGE TO SEND:', message);

  // Crear enlace de WhatsApp
  const cleanMultiMessage = message
    .split('\n')
    .filter((line) => {
      const l = line.toLowerCase();
      // Remover cualquier línea relacionada a precios o pagos
      if (l.includes('$') || /(\bar\$|\busd\b|\beur\b|\bars\b|u\$s)/i.test(l)) return false;
      if (/(monto\s*total|total\s*a\s*pagar|total\s*general|total\s*:|precio|importe|tarifa|pago|pagos|seña|señal|anticipo|saldo)/i.test(l) && /[\d.,]/.test(l)) return false;
      if (/(pesos?|dólares?|euros?)/i.test(l) && /[\d.,]/.test(l)) return false;
      // Si la línea contiene la palabra "total" y números, pero no es sobre huéspedes, eliminarla
      if (l.includes('total') && /\d/.test(l) && !/(huésped|huesped)/i.test(l)) return false;
      return true;
    })
    .join('\n');

  const sanitizedMessage = cleanMultiMessage
    .replace(/(\$|\b(?:ar\$|usd|eur|ars|u\$s)\b)\s*[\d.,]+/gi, '')
    .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[\d.,]+/gi, '')
    .replace(/\b(?:total(?:\s*general)?|precio|importe|tarifa|pago(?:s)?|saldo|anticipo|señ[aa]?)\b\s*:?\s*[\d.,]+[^\n]*/gim, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const whatsappLink = `https://wa.me/${guest.phone}?text=${encodeURIComponent(sanitizedMessage)}`;
  
  // Clear any text selection to avoid OS/app including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  // Abrir WhatsApp
  window.open(whatsappLink, '_blank');
};
