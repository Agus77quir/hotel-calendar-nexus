
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle, User, Calendar, Home, DollarSign } from 'lucide-react';
import { Guest, Room, Reservation } from '@/types/hotel';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useState } from 'react';

interface ReservationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  guest: Guest;
  room: Room;
}

export const ReservationConfirmationModal = ({
  isOpen,
  onClose,
  reservation,
  guest,
  room
}: ReservationConfirmationModalProps) => {
  const { sendReservationEmail } = useEmailNotifications();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendConfirmation = async () => {
    setIsSending(true);
    try {
      await sendReservationEmail('created', guest, reservation, room);
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-green-700">
                ¡Reserva creada exitosamente!
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                La reserva ha sido registrada en el sistema
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Detalles de la Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Huésped</p>
                    <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{guest.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Habitación</p>
                    <p className="font-medium">#{room.number}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">${reservation.total_amount}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">{formatDate(reservation.check_in)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-medium">{formatDate(reservation.check_out)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!emailSent ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Enviar Confirmación por Email</h4>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  ¿Desea enviar un email de confirmación con todos los detalles de la reserva a {guest.email}?
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendConfirmation}
                    disabled={isSending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSending ? 'Enviando...' : 'Enviar Confirmación'}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Omitir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">Email Enviado</h4>
                    <p className="text-sm text-green-700">
                      La confirmación ha sido enviada exitosamente a {guest.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant={emailSent ? "default" : "outline"}>
            {emailSent ? 'Finalizar' : 'Cerrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
