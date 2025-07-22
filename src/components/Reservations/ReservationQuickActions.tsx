
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Reservation, Guest, Room } from '@/types/hotel';

interface ReservationQuickActionsProps {
  reservation: Reservation;
  guest: Guest;
  room: Room;
  onStatusChange: (reservationId: string, newStatus: Reservation['status']) => Promise<void>;
}

export const ReservationQuickActions: React.FC<ReservationQuickActionsProps> = ({
  reservation,
  guest,
  room,
  onStatusChange,
}) => {
  const handleConfirm = async () => {
    try {
      await onStatusChange(reservation.id, 'confirmed');
      toast.success('Reserva confirmada');
    } catch (error) {
      toast.error('Error al confirmar la reserva');
    }
  };

  const handleCancel = async () => {
    try {
      await onStatusChange(reservation.id, 'cancelled');
      toast.success('Reserva cancelada');
    } catch (error) {
      toast.error('Error al cancelar la reserva');
    }
  };

  const handleSendWhatsApp = () => {
    const message = `Hola ${guest.first_name}, tu reserva en la habitación ${room.number} del ${reservation.check_in} al ${reservation.check_out} está confirmada. Número de confirmación: ${reservation.confirmation_number}`;
    const phoneNumber = guest.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp abierto');
  };

  const handleGeneratePDF = () => {
    toast.info('Generando PDF...');
    // PDF generation would be implemented here
  };

  return (
    <div className="flex gap-2">
      {reservation.status === 'confirmed' && (
        <>
          <Button onClick={handleConfirm} size="sm" variant="outline" className="text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
          <Button onClick={handleCancel} size="sm" variant="outline" className="text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </>
      )}
      
      <Button onClick={handleSendWhatsApp} size="sm" variant="outline">
        <MessageCircle className="h-4 w-4 mr-1" />
        WhatsApp
      </Button>
      
      <Button onClick={handleGeneratePDF} size="sm" variant="outline">
        <FileText className="h-4 w-4 mr-1" />
        PDF
      </Button>
    </div>
  );
};
