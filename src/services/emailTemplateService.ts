
import { Guest, Room, Reservation } from '@/types/hotel';

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

export const generateConfirmationEmailTemplate = (
  guest: Guest,
  reservation: Reservation,
  room: Room
): { subject: string; body: string } => {
  const reservationNumber = generateSimpleId(reservation.id);
  const guestName = `${guest.first_name} ${guest.last_name}`;
  const arrivalDate = formatDate(reservation.check_in);
  const departureDate = formatDate(reservation.check_out);

  const subject = `Confirmación de Reserva - Hotel Nardini S.R.L - ${reservationNumber}`;
  
  const body = `Estimado/a ${guestName},

¡Gracias por elegir Hotel Nardini S.R.L! Nos complace confirmar su reserva.

📋 DETALLES DE SU RESERVA:
• Número de Reserva: ${reservationNumber}
• Hotel: Hotel Nardini S.R.L
• Dirección: Av. Principal 123, Centro de la Ciudad
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
• Acceso a WiFi gratuito
• Acceso a la piscina

📝 INSTRUCCIONES ESPECIALES:
Por favor, presente un documento de identidad válido al momento del check-in

📞 CONTACTO DEL HOTEL:
Teléfono: +1-555-123-4567
Email: recepcion@hotel.com

Estamos emocionados de recibirle y hacer que su estadía sea memorable. Si tiene alguna pregunta o necesita asistencia especial, no dude en contactarnos.

¡Esperamos verle pronto!

Saludos cordiales,
Equipo de Hotel Nardini S.R.L

---
Este es un correo de confirmación. Por favor, conserve esta información para su llegada.`;

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
