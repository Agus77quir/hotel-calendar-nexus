
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Mail, 
  MessageCircle, 
  UserPlus,
  Download,
  AlertCircle
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { sendReservationConfirmationAutomatically } from '@/services/automatedEmailService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { generateReservationPDF } from '@/services/pdfService';

interface ReservationQuickActionsProps {
  reservation: Reservation;
  guest: Guest;
  room: Room;
  onStatusChange: (reservationId: string, newStatus: Reservation['status']) => void;
  onNewReservation: (guestId: string) => void;
}

export const ReservationQuickActions = ({
  reservation,
  guest,
  room,
  onStatusChange,
  onNewReservation
}: ReservationQuickActionsProps) => {
  const { toast } = useToast();

  const handleQuickCheckIn = async () => {
    try {
      await onStatusChange(reservation.id, 'checked-in');
      toast({
        title: "Check-in realizado",
        description: `${guest.first_name} ${guest.last_name} ha sido registrado en la habitación ${room.number}. La habitación ahora está ocupada.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-in",
        variant: "destructive",
      });
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      await onStatusChange(reservation.id, 'checked-out');
      toast({
        title: "Check-out realizado",
        description: `${guest.first_name} ${guest.last_name} ha finalizado su estadía. La habitación ${room.number} ahora está disponible.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-out",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    try {
      const sent = await sendReservationConfirmationAutomatically(guest, reservation, room);
      if (sent) {
        toast({
          title: "Email enviado",
          description: `Confirmación enviada a ${guest.email}`,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error enviando email",
        variant: "destructive",
      });
    }
  };

  const handleSendWhatsApp = () => {
    try {
      sendReservationToWhatsApp(reservation, guest, room);
      toast({
        title: "WhatsApp enviado",
        description: `Mensaje enviado a ${guest.phone}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error enviando WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    try {
      generateReservationPDF(reservation, guest, room);
      toast({
        title: "PDF generado",
        description: "Voucher de reserva descargado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generando PDF",
        variant: "destructive",
      });
    }
  };

  const isToday = (date: string) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const getStatusActions = () => {
    const actions = [];

    // Check-in automático si es hoy y está confirmada
    if (reservation.status === 'confirmed' && isToday(reservation.check_in)) {
      actions.push(
        <Button
          key="checkin"
          size="sm"
          onClick={handleQuickCheckIn}
          className="bg-green-600 hover:bg-green-700 text-white touch-manipulation"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Check-in
        </Button>
      );
    }

    // Check-out automático si es hoy y está registrado
    if (reservation.status === 'checked-in' && isToday(reservation.check_out)) {
      actions.push(
        <Button
          key="checkout"
          size="sm"
          onClick={handleQuickCheckOut}
          className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
        >
          <Clock className="h-3 w-3 mr-1" />
          Check-out
        </Button>
      );
    }

    return actions;
  };

  const getNotificationBadges = () => {
    const badges = [];

    // Alerta si llega hoy y no tiene confirmación
    if (isToday(reservation.check_in) && reservation.status === 'confirmed') {
      badges.push(
        <Badge key="today" variant="outline" className="text-orange-600 border-orange-600">
          <Calendar className="h-3 w-3 mr-1" />
          Llega hoy
        </Badge>
      );
    }

    // Alerta si se va hoy
    if (isToday(reservation.check_out) && reservation.status === 'checked-in') {
      badges.push(
        <Badge key="checkout-today" variant="outline" className="text-blue-600 border-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          Sale hoy
        </Badge>
      );
    }

    // Alerta si no tiene teléfono
    if (!guest.phone) {
      badges.push(
        <Badge key="no-phone" variant="outline" className="text-red-600 border-red-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Sin teléfono
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Badges de estado automático */}
      <div className="flex flex-wrap gap-1">
        {getNotificationBadges()}
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-1 flex-wrap">
        {/* Acciones de estado */}
        {getStatusActions()}

        {/* Comunicación */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSendEmail}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 touch-manipulation"
        >
          <Mail className="h-3 w-3" />
        </Button>

        {guest.phone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendWhatsApp}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 touch-manipulation"
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
        )}

        {/* Nueva reserva */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNewReservation(guest.id)}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 touch-manipulation"
        >
          <UserPlus className="h-3 w-3" />
        </Button>

        {/* Descargar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadPDF}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 touch-manipulation"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
