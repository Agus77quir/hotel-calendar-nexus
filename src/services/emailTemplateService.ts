
import { Guest, Room, Reservation } from '@/types/hotel';
import { parseStringToDate } from '@/utils/dateUtils';

const generateSimpleId = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

const formatDate = (dateString: string): string => {
  // Use the utility function that handles timezone correctly
  const date = parseStringToDate(dateString);
  
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
