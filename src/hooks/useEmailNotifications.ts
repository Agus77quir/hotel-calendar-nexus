
import { useToast } from '@/hooks/use-toast';
import { Guest, Room, Reservation } from '@/types/hotel';

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendReservationEmail = async (
    type: 'created' | 'confirmed' | 'checkedIn' | 'checkedOut' | 'cancelled',
    guest: Guest,
    reservation: Reservation,
    room: Room
  ) => {
    try {
      console.log(`Preparando email de ${type} para ${guest.email}`);
      
      // Usar directamente mailto como método principal
      const emailData = {
        to: guest.email,
        type,
        guestName: `${guest.first_name} ${guest.last_name}`,
        reservationDetails: {
          id: reservation.id.slice(0, 8),
          roomNumber: room.number,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          totalAmount: reservation.total_amount,
          guestsCount: reservation.guests_count
        }
      };

      sendMailtoEmail(emailData);
      
    } catch (error) {
      console.error('Error enviando notificación de email:', error);
      toast({
        title: "Error",
        description: "No se pudo preparar el email de confirmación",
        variant: "destructive"
      });
    }
  };

  const sendMailtoEmail = (emailData: any) => {
    const { to, type, guestName, reservationDetails } = emailData;
    
    const subjects = {
      created: 'Reserva Creada - Confirmación',
      confirmed: 'Reserva Confirmada - Hotel',
      checkedIn: 'Bienvenido - Check-in Completado',
      checkedOut: 'Gracias por su visita - Check-out',
      cancelled: 'Reserva Cancelada'
    };

    const messages = {
      created: 'Su reserva ha sido creada exitosamente. Estamos emocionados de recibirle.',
      confirmed: 'Su reserva ha sido confirmada. Por favor, llegue a la hora indicada.',
      checkedIn: '¡Bienvenido! Su check-in ha sido completado exitosamente.',
      checkedOut: 'Su check-out ha sido completado. Gracias por elegirnos.',
      cancelled: 'Su reserva ha sido cancelada como solicitado.'
    };

    const subject = subjects[type as keyof typeof subjects];
    const message = messages[type as keyof typeof messages];
    
    let emailBody = `Estimado/a ${guestName},\n\n${message}\n\n`;
    emailBody += `Detalles de su reserva:\n`;
    emailBody += `- ID: ${reservationDetails.id}\n`;
    emailBody += `- Habitación: ${reservationDetails.roomNumber}\n`;
    emailBody += `- Check-in: ${formatDate(reservationDetails.checkIn)}\n`;
    emailBody += `- Check-out: ${formatDate(reservationDetails.checkOut)}\n`;
    emailBody += `- Huéspedes: ${reservationDetails.guestsCount}\n`;
    emailBody += `- Total: $${reservationDetails.totalAmount}\n\n`;
    emailBody += `Gracias por elegirnos.\n\nSaludos cordiales,\nEquipo del Hotel`;

    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
    
    console.log('Email preparado (mailto):', { to, subject });
    toast({
      title: "Email preparado",
      description: `Se abrió el cliente de correo para enviar a ${to}`,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    sendReservationEmail
  };
};
