
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
  Phone,
  Mail,
  Download,
  MessageCircle,
  Edit
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { formatDisplayDate } from '@/utils/dateUtils';
import { openEmailClient } from '@/services/emailTemplateService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { generateReservationPDF } from '@/services/pdfService';

interface MultiReservationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  guest: Guest | undefined;
  rooms: Room[];
  onEdit?: (reservationId: string) => void;
}

export const MultiReservationViewModal = ({ 
  isOpen, 
  onClose, 
  reservations, 
  guest, 
  rooms,
  onEdit 
}: MultiReservationViewModalProps) => {
  if (!guest || reservations.length === 0) return null;

  const totalAmount = reservations.reduce((sum, res) => sum + Number(res.total_amount), 0);
  const totalGuests = reservations.reduce((sum, res) => sum + res.guests_count, 0);

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
    // Enviar email usando la primera reserva como referencia
    const firstReservation = reservations[0];
    const firstRoom = rooms.find(r => r.id === firstReservation.room_id);
    if (firstRoom) {
      openEmailClient(guest, firstReservation, firstRoom);
    }
  };

  const handleSendWhatsApp = () => {
    // Enviar WhatsApp usando la primera reserva como referencia
    const firstReservation = reservations[0];
    const firstRoom = rooms.find(r => r.id === firstReservation.room_id);
    if (firstRoom) {
      sendReservationToWhatsApp(firstReservation, guest, firstRoom);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Generar PDF para la primera reserva como referencia
      const firstReservation = reservations[0];
      const firstRoom = rooms.find(r => r.id === firstReservation.room_id);
      if (firstRoom) {
        await generateReservationPDF(firstReservation, guest, firstRoom);
      }
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
                Reservas Múltiples de {guest.first_name} {guest.last_name}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {reservations.length} Habitaciones
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalGuests} huéspedes total
                </span>
              </div>
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
                <h3 className="font-semibold">Detalles de las Reservas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {formatDisplayDate(reservations[0].check_in)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {formatDisplayDate(reservations[0].check_out)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de huéspedes</p>
                  <p className="font-medium">{totalGuests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total general</p>
                  <p className="font-semibold text-green-600">${totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Individual room details */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Habitaciones reservadas:</h4>
                {reservations.map((reservation, index) => {
                  const room = rooms.find(r => r.id === reservation.room_id);
                  if (!room) return null;

                  return (
                    <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-mono font-bold text-blue-800">
                          #{formatRoomNumber(room.number)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{formatRoomType(room.type)}</div>
                          <div className="text-xs text-gray-500">
                            {reservation.guests_count} huéspedes • ${Number(reservation.total_amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(reservation.status)} border text-xs`}>
                          {getStatusText(reservation.status)}
                        </Badge>
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(reservation.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {reservations[0].special_requests && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Solicitudes especiales</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{reservations[0].special_requests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
