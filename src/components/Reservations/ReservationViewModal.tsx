
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  User, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  Phone,
  Mail,
  FileText,
  Download,
  MessageCircle,
  Edit
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { openEmailClient } from '@/services/emailTemplateService';
import { sendReservationToWhatsAppSanitized } from '@/services/whatsappSanitized';
import { generateReservationPDF } from '@/services/pdfService';
import { formatDisplayDate } from '@/utils/dateUtils';

interface ReservationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | undefined;
  guest: Guest | undefined;
  room: Room | undefined;
  onEdit?: () => void;
}

export const ReservationViewModal = ({ isOpen, onClose, reservation, guest, room, onEdit }: ReservationViewModalProps) => {
  if (!reservation || !guest || !room) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'checked-in':
        return 'Registrado';
      case 'checked-out':
        return 'Check-out';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatRoomType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRoomNumber = (number: string) => {
    return number.length === 1 ? `0${number}` : number;
  };

  const handleSendEmail = () => {
    openEmailClient(guest, reservation, room);
  };

  const handleSendWhatsApp = () => {
    sendReservationToWhatsAppSanitized(reservation, guest, room);
  };

  const handleDownloadPDF = async () => {
    try {
      await generateReservationPDF(reservation, guest, room);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pr-16 pb-2">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">
                Reserva de {guest.first_name} {guest.last_name}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${getStatusColor(reservation.status)} border`}>
                  {getStatusText(reservation.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Habitación {formatRoomNumber(room.number)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Mail className="h-4 w-4" />
                  Enviar Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Información del Huésped</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre completo</p>
                  <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{guest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">{guest.document}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nacionalidad</p>
                  <p className="font-medium">{guest.nationality}</p>
                </div>
                {guest.is_associated && (
                  <div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Huésped Asociado
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Detalles de la Reserva</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {formatDisplayDate(reservation.check_in)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {formatDisplayDate(reservation.check_out)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de huéspedes</p>
                  <p className="font-medium">{reservation.guests_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold text-green-600">${reservation.total_amount}</p>
                </div>
              </div>

              {reservation.special_requests && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Solicitudes especiales</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{reservation.special_requests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Room Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Información de la Habitación</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-mono text-lg font-bold text-blue-800">
                    #{formatRoomNumber(room.number)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{formatRoomType(room.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacidad</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio por noche</p>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${room.price}
                  </p>
                </div>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Amenidades</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
