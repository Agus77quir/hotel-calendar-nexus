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
import { useHotelData } from '@/hooks/useHotelData';
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
  const { forceRefresh } = useHotelData();
  const [processing, setProcessing] = useState(false);

  const handleQuickCheckIn = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      console.log('🎯 CRITICAL QUICK CHECK-IN: Starting for reservation:', reservation.id);
      
      await onStatusChange(reservation.id, 'checked-in');
      
      // CRITICAL: Guaranteed refresh cycles
      console.log('🔄 CRITICAL QUICK CHECK-IN: Starting guaranteed refresh cycles');
      await forceRefresh();
      
      // Multiple guaranteed refresh cycles
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-IN: Secondary refresh completed');
      }, 200);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-IN: Tertiary refresh completed');
      }, 800);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-IN: Final refresh completed');
      }, 2000);
      
      console.log('✅ CRITICAL QUICK CHECK-IN: Completed with guaranteed updates');
      
      toast({
        title: "Check-in realizado exitosamente",
        description: `${guest.first_name} ${guest.last_name} ha sido registrado en la habitación ${room.number}. Sistema actualizado automáticamente.`,
      });
    } catch (error) {
      console.error('❌ CRITICAL QUICK CHECK-IN: Error:', error);
      toast({
        title: "Error",
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
      console.log('🎯 CRITICAL QUICK CHECK-OUT: Starting for reservation:', reservation.id);
      
      await onStatusChange(reservation.id, 'checked-out');
      
      // CRITICAL: Guaranteed refresh cycles
      console.log('🔄 CRITICAL QUICK CHECK-OUT: Starting guaranteed refresh cycles');
      await forceRefresh();
      
      // Multiple guaranteed refresh cycles
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-OUT: Secondary refresh completed');
      }, 200);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-OUT: Tertiary refresh completed');
      }, 800);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 CRITICAL QUICK CHECK-OUT: Final refresh completed');
      }, 2000);
      
      console.log('✅ CRITICAL QUICK CHECK-OUT: Completed with guaranteed updates');
      
      toast({
        title: "Check-out realizado exitosamente",
        description: `${guest.first_name} ${guest.last_name} ha finalizado su estadía. La habitación ${room.number} ahora está disponible. Sistema actualizado automáticamente.`,
      });
    } catch (error) {
      console.error('❌ CRITICAL QUICK CHECK-OUT: Error:', error);
      toast({
        title: "Error",
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

    // Check-in para cualquier reserva confirmada (sin restricción de fecha)
    if (reservation.status === 'confirmed') {
      actions.push(
        <Button
          key="checkin"
          size="sm"
          onClick={handleQuickCheckIn}
          disabled={processing}
          className="bg-green-600 hover:bg-green-700 text-white touch-manipulation disabled:opacity-50"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {processing ? 'Procesando...' : isToday(reservation.check_in) ? 'Check-in' : 'Check-in Anticipado'}
        </Button>
      );
    }

    // Check-out para cualquier reserva registrada (sin restricción de fecha)
    if (reservation.status === 'checked-in') {
      actions.push(
        <Button
          key="checkout"
          size="sm"
          onClick={handleQuickCheckOut}
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation disabled:opacity-50"
        >
          <Clock className="h-3 w-3 mr-1" />
          {processing ? 'Procesando...' : isToday(reservation.check_out) ? 'Check-out' : 'Check-out Anticipado'}
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

    // Badge para huéspedes actualmente registrados
    if (reservation.status === 'checked-in') {
      badges.push(
        <Badge key="current-guest" variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Huésped Registrado
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
