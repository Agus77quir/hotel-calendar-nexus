
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

// Function to generate a simple sequential ID based on the UUID
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
      console.log('Enviando email de confirmación automatizado...');
      
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
        hotelContact: 'Teléfono: +1-555-123-4567 | Email: agusquir@gmail.com',
        additionalServices: 'Desayuno incluido, Acceso a WiFi gratuito, Acceso a la piscina',
        specialInstructions: 'Por favor, presente un documento de identidad válido al momento del check-in'
      };

      // Call the Supabase edge function
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://yoyqanexcqdcolxnnnns.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveXFhbmV4Y3FkY29seG5ubm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTQwODgsImV4cCI6MjA2MjI5MDA4OH0.0NvNQuOBmRe6JCajt2bNj7_bfhcgTK_p7aqjieJWxmo'
      );

      const emailContent = generateAutomatedConfirmationEmail(emailData);
      
      const { data, error } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          to: guest.email,
          from: 'agusquir@gmail.com',
          subject: `Confirmación de Reserva - ${emailData.hotelName}`,
          guestName: emailData.guestName,
          emailContent: emailContent,
          reservationDetails: {
            id: emailData.reservationNumber,
            roomNumber: room.number,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out,
            totalAmount: reservation.total_amount
          }
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw new Error('Error al enviar email de confirmación');
      }

      console.log('Email de confirmación enviado exitosamente:', data);
      return { success: true };

    } catch (error) {
      console.error('Error en servicio de email automatizado:', error);
      
      // Fallback to mailto if edge function fails
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
        hotelContact: 'Teléfono: +1-555-123-4567 | Email: agusquir@gmail.com',
        additionalServices: 'Desayuno incluido, Acceso a WiFi gratuito, Acceso a la piscina',
        specialInstructions: 'Por favor, presente un documento de identidad válido al momento del check-in'
      };

      const emailContent = generateAutomatedConfirmationEmail(emailData);
      const subject = `Confirmación de Reserva - ${emailData.hotelName}`;
      const mailtoLink = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
      
      try {
        window.open(mailtoLink, '_blank');
        console.log('Fallback to mailto link opened');
        return { success: true };
      } catch (mailtoError) {
        console.error('Error opening mailto link:', mailtoError);
        throw new Error('No se pudo enviar el email de confirmación');
      }
    }
  };

  return {
    sendReservationConfirmationEmail
  };
};
