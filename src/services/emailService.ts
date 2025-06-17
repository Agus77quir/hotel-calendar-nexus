
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

export const sendEmailNotification = async (notification: EmailNotification) => {
  try {
    // Crear el contenido del email
    const emailBody = generateEmailContent(notification);
    
    // Usar mailto para abrir el cliente de correo del usuario
    const mailtoLink = `mailto:${notification.to}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Abrir el cliente de correo
    window.open(mailtoLink, '_blank');
    
    // También mostrar el contenido en consola para desarrollo
    console.log('Email enviado a:', notification.to);
    console.log('Asunto:', notification.subject);
    console.log('Contenido:', emailBody);
    
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
};

const generateEmailContent = (notification: EmailNotification): string => {
  const { guestName, message, reservationDetails } = notification;
  
  let content = `Estimado/a ${guestName},\n\n${message}\n\n`;
  
  if (reservationDetails) {
    content += `Detalles de su reserva:\n`;
    content += `- ID de Reserva: ${reservationDetails.id}\n`;
    content += `- Habitación: ${reservationDetails.roomNumber}\n`;
    content += `- Check-in: ${formatDate(reservationDetails.checkIn)}\n`;
    content += `- Check-out: ${formatDate(reservationDetails.checkOut)}\n`;
    content += `- Total: $${reservationDetails.totalAmount}\n\n`;
  }
  
  content += `Gracias por elegirnos.\n\nSaludos cordiales,\nEquipo del Hotel`;
  
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
