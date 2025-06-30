
export interface EmailNotification {
  to: string;
  subject: string;
  message: string;
  guestName: string;
  reservationDetails?: {
    id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  };
}

// Function to generate a simple sequential ID based on the UUID
const generateSimpleId = (uuid: string): string => {
  // Convert the first 8 characters of UUID to a number and format it
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  // Use modulo to keep it within a reasonable range and format with leading zeros
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

export const sendEmailNotification = async (notification: EmailNotification) => {
  console.log('Iniciando envío de email a:', notification.to);
  console.log('Detalles de reserva:', notification.reservationDetails);
  
  try {
    // Try to use the Supabase edge function first
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://yoyqanexcqdcolxnnnns.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveXFhbmV4Y3FkY29seG5ubm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTQwODgsImV4cCI6MjA2MjI5MDA4OH0.0NvNQuOBmRe6JCajt2bNj7_bfhcgTK_p7aqjieJWxmo'
    );
    
    console.log('Llamando a edge function con datos:', {
      to: notification.to,
      guestName: notification.guestName,
      reservationDetails: notification.reservationDetails,
      from: 'agusquir@gmail.com'
    });
    
    const { data, error } = await supabase.functions.invoke('send-reservation-email', {
      body: {
        to: notification.to,
        from: 'agusquir@gmail.com',
        guestName: notification.guestName,
        reservationDetails: {
          ...notification.reservationDetails,
          id: notification.reservationDetails?.id ? generateSimpleId(notification.reservationDetails.id) : '01'
        }
      }
    });
    
    if (error) {
      console.error('Error from edge function:', error);
      throw new Error('Error al enviar email via edge function');
    }
    
    console.log('Email sent successfully via edge function:', data);
    return { success: true };
    
  } catch (error) {
    console.error('Error in email service:', error);
    
    // Fallback to mailto if edge function fails
    const emailBody = generateEmailContent(notification);
    const mailtoLink = `mailto:${notification.to}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(emailBody)}`;
    
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

const generateEmailContent = (notification: EmailNotification): string => {
  const { guestName, message, reservationDetails } = notification;
  
  let content = `Estimado/a ${guestName},\n\n${message}\n\n`;
  
  if (reservationDetails) {
    // Generate simple ID from the UUID
    const simpleId = generateSimpleId(reservationDetails.id);
    
    content += `Detalles de su reserva:\n`;
    content += `- ID de Reserva: ${simpleId}\n`;
    content += `- Habitación: ${reservationDetails.roomNumber}\n`;
    content += `- Check-in: ${formatDate(reservationDetails.checkIn)}\n`;
    content += `- Check-out: ${formatDate(reservationDetails.checkOut)}\n`;
    content += `- Total: $${reservationDetails.totalAmount}\n\n`;
  }
  
  content += `Gracias por elegirnos.\n\nSaludos cordiales,\nEquipo del Hotel\n\nContacto: agusquir@gmail.com`;
  
  return content;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Tipos de notificaciones predefinidas
export const emailTemplates = {
  reservationCreated: (guestName: string) => ({
    subject: 'Confirmación de Reserva - Hotel',
    message: `Su reserva ha sido creada exitosamente. Estamos emocionados de recibirle en nuestro hotel.`
  }),
  
  reservationConfirmed: (guestName: string) => ({
    subject: 'Reserva Confirmada - Hotel',
    message: `Su reserva ha sido confirmada. Por favor, llegue a la hora indicada para su check-in.`
  }),
  
  checkInCompleted: (guestName: string) => ({
    subject: 'Bienvenido - Check-in Completado',
    message: `¡Bienvenido/a a nuestro hotel! Su check-in ha sido completado exitosamente. Esperamos que disfrute su estadía.`
  }),
  
  checkOutCompleted: (guestName: string) => ({
    subject: 'Gracias por su visita - Check-out Completado',
    message: `Su check-out ha sido completado. Gracias por elegirnos y esperamos verle pronto de nuevo.`
  }),
  
  reservationCancelled: (guestName: string) => ({
    subject: 'Reserva Cancelada - Hotel',
    message: `Su reserva ha sido cancelada como solicitado. Si tiene alguna pregunta, no dude en contactarnos.`
  })
};
