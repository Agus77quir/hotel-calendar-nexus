
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
  const hexString = uuid.replace(/-/g, '').substring(0, 8);
  const number = parseInt(hexString, 16);
  const simpleId = (number % 99) + 1;
  return simpleId.toString().padStart(2, '0');
};

export const sendEmailNotification = async (notification: EmailNotification) => {
  console.log('📧 Email de confirmación generado para:', notification.to);
  
  const emailContent = generateEmailContent(notification);
  
  // Show email content in browser alert for immediate feedback
  const emailPreview = `
CORREO DE CONFIRMACIÓN GENERADO:
===============================
Para: ${notification.to}
Asunto: ${notification.subject}
===============================

${emailContent}

===============================
✅ Email procesado exitosamente
  `;
  
  // Show in console for debugging
  console.log(emailPreview);
  
  // Show alert to user so they can see the email was "sent"
  alert(emailPreview);
  
  return { success: true, message: 'Email de confirmación mostrado correctamente' };
};

const generateEmailContent = (notification: EmailNotification): string => {
  const { guestName, message, reservationDetails } = notification;
  
  let content = `Estimado/a ${guestName},\n\n${message}\n\n`;
  
  if (reservationDetails) {
    const simpleId = generateSimpleId(reservationDetails.id);
    
    content += `Detalles de su reserva:\n`;
    content += `- ID de Reserva: ${simpleId}\n`;
    content += `- Habitación: ${reservationDetails.roomNumber}\n`;
    content += `- Check-in: ${formatDate(reservationDetails.checkIn)}\n`;
    content += `- Check-out: ${formatDate(reservationDetails.checkOut)}\n`;
    content += `- Total: $${reservationDetails.totalAmount}\n\n`;
  }
  
  content += `Gracias por elegirnos.\n\nSaludos cordiales,\nEquipo del Hotel\n\nContacto: recepcion@hotel.com`;
  
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
    subject: 'Confirmación de Reserva - Hotel Sol y Luna',
    message: `Su reserva ha sido creada exitosamente. Estamos emocionados de recibirle en nuestro hotel.`
  }),
  
  reservationConfirmed: (guestName: string) => ({
    subject: 'Reserva Confirmada - Hotel Sol y Luna',
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
    subject: 'Reserva Cancelada - Hotel Sol y Luna',
    message: `Su reserva ha sido cancelada como solicitado. Si tiene alguna pregunta, no dude en contactarnos.`
  })
};
