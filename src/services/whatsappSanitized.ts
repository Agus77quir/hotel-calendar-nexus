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
• ${reservations.length} Habitaciones: ${roomNumbersText}
• ${totalGuests} huéspedes total

• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  // Strict sanitization: remove ANY monetary info or 'total' not about huéspedes
  const sanitizeNoAmounts = (text: string): string => {
    const filtered = text
      .split('\n')
      .filter((line) => {
        const l = line.toLowerCase();
        if (l.includes('$') || /(?:\bar\$|\bu\$s\b|\busd\b|\beur\b|\bars\b)/i.test(l)) return false;
        if (/(monto\s*total|total\s*a\s*(pagar|abonar)|total\s*general|total\s*:|precio|importe|tarifa|pago(?:s)?|pagado|abonado|señ[aa]l?|anticipo|saldo|balance|restante|resto|costo|coste)/i.test(l)) return false;
        if (/\btotal\b/i.test(l) && /\d/.test(l) && !/(hu[eé]sped(?:es)?)/i.test(l)) return false;
        return true;
      })
      .join('\n');

    return filtered
      .replace(/(?:\$|€|\b(?:ar\$|u\$s|usd|eur|ars)\b)\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/\b(?:pesos?|dólares?|euros?)\b\s*[0-9]+(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?/gim, '')
      .replace(/^.*\btotal\b(?!.*hu[eé]sped).*$/gim, '')
      .replace(/\b(hu[eé]sped(?:es)?)\s*total\b/gi, '$1')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
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
