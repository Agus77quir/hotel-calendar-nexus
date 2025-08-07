
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, MapPin, DollarSign, FileText, Users, Mail, MessageCircle, Download } from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { openEmailClient } from '@/services/emailTemplateService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { generateReservationPDF } from '@/services/pdfService';

interface ReservationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  guest: Guest;
  room: Room;
}

export const ReservationViewModal = ({
  isOpen,
  onClose,
  reservation,
  guest,
  room
}: ReservationViewModalProps) => {
  const { toast } = useToast();

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmada</Badge>;
      case 'checked-in':
        return <Badge className="bg-green-500">Registrado</Badge>;
      case 'checked-out':
        return <Badge variant="secondary">Check-out</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendEmail = () => {
    try {
      openEmailClient(guest, reservation, room);
      toast({
        title: "📧 Email preparado",
        description: `Se abrió el cliente de email para enviar confirmación a ${guest.email}`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error preparando email",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pr-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">
                Detalles de Reserva #{reservation.id.slice(0, 8)}
              </DialogTitle>
            </div>
            <div className="flex-shrink-0 mt-1">
              {getStatusBadge(reservation.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botones de Acción */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
                
                {guest.phone && (
                  <Button
                    onClick={handleSendWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                )}
                
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información del Huésped */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-purple-600" />
                Información del Huésped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{guest.phone || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">{guest.document}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nacionalidad</p>
                  <p className="font-medium">{guest.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {guest.is_associated ? (
                    <Badge variant="outline" className="text-green-600">
                      Huésped Asociado
                    </Badge>
                  ) : (
                    <Badge variant="outline">Huésped Regular</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Habitación */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                Información de la Habitación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-medium">#{room.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{room.type.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacidad</p>
                  <p className="font-medium">{room.capacity} personas</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio por Noche</p>
                  <p className="font-medium">${Number(room.price).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Reserva */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Información de la Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Huéspedes</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <p className="font-medium">{reservation.guests_count}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-lg">${Number(reservation.total_amount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {reservation.special_requests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Solicitudes Especiales
                    </p>
                    <p className="font-medium mt-1 p-3 bg-muted rounded-md">
                      {reservation.special_requests}
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p>Creada el: {format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                </div>
                <div>
                  <p>Actualizada el: {format(new Date(reservation.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
