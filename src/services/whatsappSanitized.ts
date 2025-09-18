import { Reservation, Guest, Room } from '@/types/hotel';

const generateSimpleId = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const sendMultipleReservationToWhatsAppSanitized = (
  reservations: Reservation[],
  guest: Guest,
  rooms: Room[]
) => {
  const firstReservation = reservations[0];
  const reservationNumber = generateSimpleId(firstReservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(firstReservation.check_in);
  const departureDate = formatDate(firstReservation.check_out);

  // Build room numbers list matching each reservation
  const roomDetails: string[] = reservations.map((res, i) => {
    const match = rooms.find(r => r.id === res.room_id);
    if (!match) return `#ERROR-${i + 1}`;
    const num = match.number.length === 1 ? `0${match.number}` : match.number;
    return `#${num}`;
  });

  const roomNumbersText = roomDetails.join(', ');
  const totalGuests = reservations.reduce((sum, res) => sum + res.guests_count, 0);

  const message = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva múltiple.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Fecha de salida: ${departureDate}
• Habitaciones: ${roomNumbersText}
• ${totalGuests} huéspedes

• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  // Strict sanitization: remove ANY monetary info or 'total' not about huéspedes
  const sanitizeNoAmounts = (text: string): string => {
    const lines = text.split('\n');

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

    const joined = filtered
      .join('\n')
      .replace(/(?:[$€£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/\b(?:pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/^\s*[•-]?\s*(?:monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|senal|anticipo|saldo|balance|restante|resto|costo|coste|total).*$/gim, '')
      .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const final = joined
      .split('\n')
      .filter((line) => {
        const lnorm = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/[€$£]/.test(line)) return false;
        if (/\b(total|monto|importe|precio|tarifa|pago|pagos|pagado|abonado|senal|seña|anticipo|saldo|costo|coste)\b/i.test(lnorm) && !/\bhuesped(?:es)?\b/.test(lnorm)) return false;
        if (/\btotal\b/i.test(line) && !isGuestCountLine(line)) return false;
        return true;
      })
      .join('\n');

    // Ultra-strict final pass: remove any residual 'monto total' or 'total: $...' patterns
    const ultimate = final
      .replace(/^.*\bmonto\s*total\b.*$/gim, '')
      .replace(/\b(?:monto\s*)?total\b\s*[:\-]?\s*(?:[€$£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)?\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return ultimate;
  };

  const sanitizedMessage = sanitizeNoAmounts(message);
  const whatsappLink = `https://wa.me/${guest.phone}?text=${encodeURIComponent(sanitizedMessage)}`;
  // Clear any text selection to avoid OS/app including selected amounts
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  window.open(whatsappLink, '_blank');
};

// Nueva función para reserva simple con sanitización estricta
export const sendReservationToWhatsAppSanitized = (
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
• Habitación: #${roomNumber}
• ${reservation.guests_count} huéspedes

• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  // Sanitización estricta replicada
  const sanitizeNoAmounts = (text: string): string => {
    const lines = text.split('\n');

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

    const joined = filtered
      .join('\n')
      .replace(/(?:[$€£]|\b(?:ar\$|u\$s|usd|eur|ars|clp|mxn)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/\b(?:pesos?|dolares?|dólares?|euros?|reales?|soles?|guaran[ií]es?|bol[ií]vares?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/^\s*[•-]?\s*(?:monto|importe|precio|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|senal|anticipo|saldo|balance|restante|resto|costo|coste|total).*$/gim, '')
      .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const final = joined
      .split('\n')
      .filter((line) => {
        const lnorm = line.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/[€$£]/.test(line)) return false;
        if (/\b(total|monto|importe|precio|tarifa|pago|pagos|pagado|abonado|senal|seña|anticipo|saldo|costo|coste)\b/i.test(lnorm) && !/\bhuesped(?:es)?\b/.test(lnorm)) return false;
        if (/\btotal\b/i.test(line) && !isGuestCountLine(line)) return false;
        return true;
      })
      .join('\n');

    return final;
  };

  const sanitizedMessage = sanitizeNoAmounts(message);
  const whatsappLink = `https://wa.me/${guest.phone}?text=${encodeURIComponent(sanitizedMessage)}`;
  try {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.getSelection()?.removeAllRanges();
  } catch {}
  window.open(whatsappLink, '_blank');
};
