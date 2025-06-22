
import { useToast } from '@/hooks/use-toast';
import { sendEmailNotification, emailTemplates, EmailNotification } from '@/services/emailService';
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
      let template;
      const guestName = `${guest.first_name} ${guest.last_name}`;
      
      switch (type) {
        case 'created':
          template = emailTemplates.reservationCreated(guestName);
          break;
        case 'confirmed':
          template = emailTemplates.reservationConfirmed(guestName);
          break;
        case 'checkedIn':
          template = emailTemplates.checkInCompleted(guestName);
          break;
        case 'checkedOut':
          template = emailTemplates.checkOutCompleted(guestName);
          break;
        case 'cancelled':
          template = emailTemplates.reservationCancelled(guestName);
          break;
        default:
          return;
      }

      const notification: EmailNotification = {
        to: guest.email,
        subject: template.subject,
        message: template.message,
        guestName,
        reservationDetails: {
          id: reservation.id.slice(0, 8),
          roomNumber: room.number,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          totalAmount: reservation.total_amount
        }
      };

      const result = await sendEmailNotification(notification);
      
      if (result.success) {
        toast({
          title: "Email enviado",
          description: `Notificación enviada a ${guest.email}`,
        });
      } else {
        toast({
          title: "Error al enviar email",
          description: "No se pudo enviar la notificación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      toast({
        title: "Error",
        description: "Error al enviar notificación por email",
        variant: "destructive",
      });
    }
  };

  return {
    sendReservationEmail
  };
};
