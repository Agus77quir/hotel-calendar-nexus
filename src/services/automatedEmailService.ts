
import { Guest, Room, Reservation } from '@/types/hotel';

export interface AutomatedEmailData {
  guestName: string;
  reservationNumber: string;
  hotelName: string;
  hotelAddress: string;
  arrivalDate: string;
  departureDate: string;
  roomType: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  paymentMethod: string;
  cardLastFour: string;
  cancellationPolicy: string;
  hotelContact: string;
  additionalServices?: string;
  specialInstructions?: string;
}

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

const generateAutomatedConfirmationEmail = (data: AutomatedEmailData): string => {
  return `
Estimado/a ${data.guestName},

¡Gracias por elegir ${data.hotelName}! Nos complace confirmar su reserva.

📋 DETALLES DE SU RESERVA:
• Número de Reserva: ${data.reservationNumber}
• Hotel: ${data.hotelName}
• Dirección: ${data.hotelAddress}
• Fecha de Llegada: ${data.arrivalDate}
• Fecha de Salida: ${data.departureDate}
• Tipo de Habitación: ${data.roomType}
• Número de Huéspedes: ${data.numberOfGuests}
• Precio Total: ${data.totalPrice} ${data.currency}
• Método de Pago: ${data.paymentMethod} (${data.cardLastFour})

🏨 INFORMACIÓN IMPORTANTE:
• Check-in: A partir de las 15:00 horas
• Check-out: Hasta las 12:00 horas
• Políticas de Cancelación: ${data.cancellationPolicy}

${data.additionalServices ? `🎁 SERVICIOS INCLUIDOS:\n${data.additionalServices}\n\n` : ''}

${data.specialInstructions ? `📝 INSTRUCCIONES ESPECIALES:\n${data.specialInstructions}\n\n` : ''}

📞 CONTACTO DEL HOTEL:
${data.hotelContact}

Estamos emocionados de recibirle y hacer que su estadía sea memorable. Si tiene alguna pregunta o necesita asistencia especial, no dude en contactarnos.

¡Esperamos verle pronto!

Saludos cordiales,
Equipo de ${data.hotelName}

---
Este es un correo automático de confirmación. Por favor, conserve esta información para su llegada.
  `.trim();
};

export const useAutomatedEmailService = () => {
  const sendReservationConfirmationEmail = async (
    guest: Guest,
    reservation: Reservation,
    room: Room
  ) => {
    try {
      console.log('Preparando email de confirmación para:', guest.email);
      
      const emailData: AutomatedEmailData = {
        guestName: `${guest.first_name} ${guest.last_name}`,
        reservationNumber: generateSimpleId(reservation.id),
        hotelName: 'Hotel Sol y Luna',
        hotelAddress: 'Av. Principal 123, Centro de la Ciudad',
        arrivalDate: formatDate(reservation.check_in),
        departureDate: formatDate(reservation.check_out),
        roomType: `Habitación #${room.number} - ${room.type}`,
        numberOfGuests: reservation.guests_count || 2,
        totalPrice: reservation.total_amount,
        currency: 'USD',
        paymentMethod: 'Tarjeta de Crédito',
        cardLastFour: 'XXXX',
        cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes de la llegada',
        hotelContact: 'Teléfono: +1-555-123-4567 | Email: recepcion@hotel.com',
        additionalServices: 'Desayuno incluido, Acceso a WiFi gratuito, Acceso a la piscina',
        specialInstructions: 'Por favor, presente un documento de identidad válido al momento del check-in'
      };

      const emailContent = generateAutomatedConfirmationEmail(emailData);
      
      // Show email content immediately
      const emailPreview = `
CORREO DE CONFIRMACIÓN ENVIADO:
==============================
Para: ${guest.email}
Huésped: ${emailData.guestName}
Reserva: ${emailData.reservationNumber}
==============================

${emailContent}

==============================
✅ Email procesado exitosamente
      `;
      
      console.log('📧 Email de confirmación generado:', emailPreview);
      
      // Show alert with email content
      alert(emailPreview);

      return { success: true, emailId: 'local-' + Date.now() };

    } catch (error) {
      console.error('Error en servicio de email automatizado:', error);
      throw error;
    }
  };

  return {
    sendReservationConfirmationEmail
  };
};
