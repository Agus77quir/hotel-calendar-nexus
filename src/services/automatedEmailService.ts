
import { Guest, Room, Reservation } from '@/types/hotel';
import { supabase } from '@/integrations/supabase/client';

export interface AutomatedEmailData {
  guestName: string;
  reservationNumber: string;
  hotelName: string;
  hotelAddress: string;
  arrivalDate: string;
  departureDate: string;
  roomType: string;
  numberOfGuests: number;
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

🏨 INFORMACIÓN IMPORTANTE:
• Check-in: A partir de las 15:00 horas
• Check-out: Hasta las 12:00 horas
• Políticas de Cancelación: Cancelación gratuita hasta 24 horas antes de la llegada

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
      console.log('🚀 Iniciando envío de email de confirmación a:', guest.email);
      
      const emailData: AutomatedEmailData = {
        guestName: `${guest.first_name} ${guest.last_name}`,
        reservationNumber: generateSimpleId(reservation.id),
        hotelName: 'Hotel Nardini S.R.L',
        hotelAddress: 'Av. Principal 123, Centro de la Ciudad',
        arrivalDate: formatDate(reservation.check_in),
        departureDate: formatDate(reservation.check_out),
        roomType: `Habitación #${room.number} - ${room.type}`,
        numberOfGuests: reservation.guests_count || 2,
        hotelContact: 'Teléfono: +1-555-123-4567 | Email: recepcion@hotel.com',
        additionalServices: 'Desayuno incluido, Acceso a WiFi gratuito, Acceso a la piscina',
        specialInstructions: 'Por favor, presente un documento de identidad válido al momento del check-in'
      };

      const emailContent = generateAutomatedConfirmationEmail(emailData);
      
      console.log('📧 Preparando datos para envío de email...');
      console.log('🎯 Email destino:', guest.email);
      console.log('📝 Contenido del email preparado');
      
      // Llamar a la función edge corregida de Supabase
      const { data, error } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          to: guest.email,
          subject: 'Confirmación de Reserva - Hotel Nardini S.R.L',
          guestName: emailData.guestName,
          emailContent: emailContent,
          reservationDetails: {
            id: emailData.reservationNumber,
            roomNumber: room.number,
            checkIn: reservation.check_in,
            checkOut: reservation.check_out
          }
        }
      });

      if (error) {
        console.error('❌ Error al enviar email:', error);
        
        // Check for domain verification issues
        if (error.message && error.message.includes('CONFIGURACIÓN REQUERIDA')) {
          throw new Error(`⚠️ CONFIGURACIÓN NECESARIA: ${error.message}`);
        }
        
        throw new Error(`Error enviando email: ${error.message}`);
      }

      console.log('✅ Email de confirmación enviado exitosamente:', data);
      console.log('📬 Enviado a:', data?.recipient || guest.email);
      
      return { 
        success: true, 
        emailId: data?.emailId,
        recipient: data?.recipient || guest.email,
        message: `Email enviado exitosamente a ${guest.email}`
      };

    } catch (error) {
      console.error('💥 Error en servicio de email automatizado:', error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Error de email para ${guest.email}: ${error.message}`);
      }
      
      throw error;
    }
  };

  return {
    sendReservationConfirmationEmail
  };
};
