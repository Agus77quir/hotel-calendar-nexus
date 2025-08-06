
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, User, MapPin, Phone, Mail, CreditCard, Users, Clock, DollarSign, MessageSquare, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  guest: Guest;
  room: Room;
  onEditGuest: (guest: Guest) => void;
}

export const ReservationViewModal = ({
  isOpen,
  onClose,
  reservation,
  guest,
  room,
  onEditGuest
}: ReservationViewModalProps) => {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
  };

  const statusColors = {
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'checked-in': 'bg-green-100 text-green-800 border-green-200',
    'checked-out': 'bg-gray-100 text-gray-800 border-gray-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    'confirmed': 'Confirmada',
    'checked-in': 'Check-in',
    'checked-out': 'Check-out',
    'cancelled': 'Cancelada'
  };

  const roomTypeLabels = {
    'matrimonial': 'Matrimonial',
    'triple-individual': 'Triple Individual',
    'triple-matrimonial': 'Triple Matrimonial',
    'doble-individual': 'Doble Individual',
    'suite-presidencial-doble': 'Suite Presidencial Doble'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Detalles de la Reserva #{reservation.id}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Estado de la reserva */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
              <Badge className={statusColors[reservation.status]}>
                {statusLabels[reservation.status]}
              </Badge>
            </div>

            <Separator />

            {/* Información del huésped */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-blue-600" />
                  Información del Huésped
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditGuest(guest)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Nombre:</span>
                    <p className="text-muted-foreground">{guest.first_name} {guest.last_name}</p>
                  </div>
                  
                  {guest.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{guest.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{guest.phone}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Doc: {guest.document}</span>
                  </div>
                  
                  {guest.is_associated && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Huésped Asociado
                      </Badge>
                      {guest.discount_percentage > 0 && (
                        <span className="text-sm text-green-600">
                          {guest.discount_percentage}% descuento
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Información de la habitación */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-blue-600" />
                Información de la Habitación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Habitación:</span>
                    <p className="text-muted-foreground">#{room.number}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-muted-foreground">{roomTypeLabels[room.type]}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacidad: {room.capacity} personas</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Precio: ${room.price}</span>
                  </div>
                </div>
              </div>
              
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <span className="font-medium">Servicios:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Detalles de la reserva */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                Detalles de la Reserva
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Check-in:</span>
                    <p className="text-muted-foreground">{formatDate(reservation.check_in)}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Check-out:</span>
                    <p className="text-muted-foreground">{formatDate(reservation.check_out)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Huéspedes: {reservation.guests_count}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-lg">Total: ${reservation.total_amount}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Creada: {format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                {reservation.created_by && (
                  <span>por {reservation.created_by}</span>
                )}
              </div>
            </div>

            {/* Solicitudes especiales */}
            {reservation.special_requests && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 font-medium">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Solicitudes Especiales
                  </h3>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {reservation.special_requests}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
