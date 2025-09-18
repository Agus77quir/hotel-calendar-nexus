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
  AlertTriangle
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { sendReservationConfirmationAutomatically } from '@/services/automatedEmailService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { generateReservationPDF } from '@/services/pdfService';
import { useState } from 'react';

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
  const [processing, setProcessing] = useState(false);

  const handleQuickCheckIn = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      console.log('🚀 REALIZANDO CHECK-IN:', {
        reservationId: reservation.id,
        guestName: `${guest.first_name} ${guest.last_name}`,
        roomNumber: room.number,
        checkInDate: reservation.check_in
      });

      await onStatusChange(reservation.id, 'checked-in');
      
      toast({
        title: "✅ Check-in realizado",
        description: `${guest.first_name} ${guest.last_name} registrado en habitación ${room.number}`,
      });

      console.log('✅ CHECK-IN COMPLETADO - Las tarjetas del dashboard se actualizarán automáticamente');
    } catch (error) {
      console.error('❌ ERROR EN CHECK-IN:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo realizar el check-in",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickCheckOut = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      console.log('🚀 REALIZANDO CHECK-OUT:', {
        reservationId: reservation.id,
        guestName: `${guest.first_name} ${guest.last_name}`,
        roomNumber: room.number,
        checkOutDate: reservation.check_out
      });

      await onStatusChange(reservation.id, 'checked-out');
      
      toast({
        title: "✅ Check-out realizado",
        description: `${guest.first_name} ${guest.last_name} finalizó estadía. Habitación ${room.number} disponible`,
      });

      console.log('✅ CHECK-OUT COMPLETADO - Las tarjetas del dashboard se actualizarán automáticamente');
    } catch (error) {
      console.error('❌ ERROR EN CHECK-OUT:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo realizar el check-out",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      const sent = await sendReservationConfirmationAutomatically(guest, reservation, room);
      if (sent) {
        toast({
          title: "📧 Email enviado",
          description: `Confirmación enviada a ${guest.email}`,
        });
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo enviar el email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error enviando email",
        variant: "destructive",
      });
    }
  };

  const handleSendWhatsApp = () => {
    try {
      sendReservationToWhatsApp(reservation, guest, room);
      toast({
        title: "📱 WhatsApp enviado",
        description: `Mensaje enviado a ${guest.phone}`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error enviando WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    try {
      generateReservationPDF(reservation, guest, room);
      toast({
        title: "📄 PDF generado",
        description: "Voucher de reserva descargado",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error generando PDF",
        variant: "destructive",
      });
    }
  };

  const isToday = (date: string) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const getStatusBadges = () => {
    const badges = [];

    // Estado actual
    if (reservation.status === 'checked-in') {
      badges.push(
        <Badge key="checked-in" variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          En Hotel
        </Badge>
      );
    }

    // Alertas de fecha
    if (isToday(reservation.check_in) && reservation.status === 'confirmed') {
      badges.push(
        <Badge key="today-checkin" variant="outline" className="text-orange-600 border-orange-600">
          <Calendar className="h-3 w-3 mr-1" />
          Llega Hoy
        </Badge>
      );
    }

    if (isToday(reservation.check_out) && reservation.status === 'checked-in') {
      badges.push(
        <Badge key="today-checkout" variant="outline" className="text-blue-600 border-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          Sale Hoy
        </Badge>
      );
    }

    // Alerta sin teléfono
    if (!guest.phone) {
      badges.push(
        <Badge key="no-phone" variant="outline" className="text-red-600 border-red-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Sin teléfono
        </Badge>
      );
    }

    return badges;
  };

  const getActionButtons = () => {
    const buttons = [];

    // Botones de estado
    if (reservation.status === 'confirmed') {
      buttons.push(
        <Button
          key="checkin"
          size="sm"
          onClick={handleQuickCheckIn}
          disabled={processing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {processing ? 'Procesando...' : 'Check-in'}
        </Button>
      );
    }

    if (reservation.status === 'checked-in') {
      buttons.push(
        <Button
          key="checkout"
          size="sm"
          onClick={handleQuickCheckOut}
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Clock className="h-3 w-3 mr-1" />
          {processing ? 'Procesando...' : 'Check-out'}
        </Button>
      );
    }

    // Botones de comunicación
    buttons.push(
      <Button
        key="email"
        variant="ghost"
        size="sm"
        onClick={handleSendEmail}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Mail className="h-3 w-3" />
      </Button>
    );

    if (guest.phone) {
      buttons.push(
        <Button
          key="whatsapp"
          variant="ghost"
          size="sm"
          onClick={handleSendWhatsApp}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
      );
    }

    // Botones adicionales
    buttons.push(
      <Button
        key="new-reservation"
        variant="ghost"
        size="sm"
        onClick={() => onNewReservation(guest.id)}
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      >
        <UserPlus className="h-3 w-3" />
      </Button>
    );

    buttons.push(
      <Button
        key="download"
        variant="ghost"
        size="sm"
        onClick={handleDownloadPDF}
        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
      >
        <Download className="h-3 w-3" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Badges de estado */}
      <div className="flex flex-wrap gap-1">
        {getStatusBadges()}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-1 flex-wrap">
        {getActionButtons()}
      </div>
    </div>
  );
};
