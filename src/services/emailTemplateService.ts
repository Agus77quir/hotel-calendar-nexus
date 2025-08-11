
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

  const subject = `Confirmación de Reserva - Hostería Anillaco - ${reservationNumber}`;
  
  const body = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Tipo de habitación: ${room.type}
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
  
  // Generate room details with proper formatting
  const roomDetails = reservations.map(reservation => {
    const room = rooms.find(r => r.id === reservation.room_id);
    if (!room) return '';
    
    const roomNumber = room.number.length === 1 ? `0${room.number}` : room.number;
    const roomType = room.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `• Habitación #${roomNumber} - ${roomType} (${reservation.guests_count} huéspedes)`;
  }).filter(detail => detail !== '').join('\n');

  const totalGuests = reservations.reduce((sum, res) => sum + res.guests_count, 0);
  const totalAmount = reservations.reduce((sum, res) => sum + Number(res.total_amount), 0);

  const subject = `Confirmación de Reserva Múltiple - Hostería Anillaco - ${reservationNumber}`;
  
  const body = `Estimado/a ${guestName},

¡Gracias por elegir Hostería Anillaco! Concesionaria Nardini SRL, nos complace confirmar su reserva múltiple.

Detalle de su reserva:
• Número de reserva: ${reservationNumber}
• Fecha de llegada: ${arrivalDate}
• Fecha de salida: ${departureDate}
• Total de huéspedes: ${totalGuests}
• Monto total: $${totalAmount.toLocaleString()}

Habitaciones reservadas:
${roomDetails}

• Check in: 13 hs
• Check out: 10 hs

Saludos cordiales,
Concesionaria Nardini SRL`;

  return { subject, body };
};

export const openEmailClient = (
  guest: Guest,
  reservation: Reservation,
  room: Room
) => {
  const { subject, body } = generateConfirmationEmailTemplate(guest, reservation, room);
  
  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Abrir cliente de email
  window.open(mailtoLink, '_blank');
};

export const openMultipleReservationEmailClient = (
  guest: Guest,
  reservations: Reservation[],
  rooms: Room[]
) => {
  const { subject, body } = generateMultipleReservationEmailTemplate(guest, reservations, rooms);
  
  // Crear enlace mailto
  const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Abrir cliente de email
  window.open(mailtoLink, '_blank');
};
