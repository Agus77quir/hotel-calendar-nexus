
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, MapPin } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format } from 'date-fns';

interface DailyReservationsListProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  selectedDateStr: string;
  searchTerm: string;
}

export const DailyReservationsList = ({ 
  reservations, 
  rooms, 
  guests, 
  selectedDateStr, 
  searchTerm 
}: DailyReservationsListProps) => {
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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">
          {searchTerm ? 'No se encontraron reservas que coincidan con la búsqueda' : 'No hay reservas para esta fecha'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => {
        const guest = guests.find(g => g.id === reservation.guest_id);
        const room = rooms.find(r => r.id === reservation.room_id);
        const isCheckInToday = reservation.check_in === selectedDateStr;
        const isCheckOutToday = reservation.check_out === selectedDateStr;

        return (
          <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{guest?.first_name} {guest?.last_name}</p>
                  <p className="text-sm text-muted-foreground">{guest?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Habitación {room?.number}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-sm">
                <p>{format(new Date(reservation.check_in), 'dd/MM')} - {format(new Date(reservation.check_out), 'dd/MM')}</p>
                <p className="text-muted-foreground">{reservation.guests_count} huéspedes</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <Badge className={getStatusColor(reservation.status)}>
                  {getStatusText(reservation.status)}
                </Badge>
                {isCheckInToday && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Check-in hoy
                  </Badge>
                )}
                {isCheckOutToday && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Check-out hoy
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
