
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, MapPin } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DailyReservationsProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  selectedDate: Date;
}

export const DailyReservations = ({ reservations, rooms, guests, selectedDate }: DailyReservationsProps) => {
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const dayReservations = reservations.filter(reservation => {
    const checkIn = reservation.check_in;
    const checkOut = reservation.check_out;
    return checkIn <= selectedDateStr && checkOut >= selectedDateStr;
  });

  const checkInsToday = reservations.filter(r => r.check_in === selectedDateStr);
  const checkOutsToday = reservations.filter(r => r.check_out === selectedDateStr);

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Check-ins Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{checkInsToday.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Check-outs Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{checkOutsToday.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Reservas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{dayReservations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Reservas del {format(selectedDate, 'dd \'de\' MMMM', { locale: es })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay reservas para esta fecha</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayReservations.map((reservation) => {
                const guest = guests.find(g => g.id === reservation.guest_id);
                const room = rooms.find(r => r.id === reservation.room_id);
                const isCheckInToday = reservation.check_in === selectedDateStr;
                const isCheckOutToday = reservation.check_out === selectedDateStr;

                return (
                  <div key={reservation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{guest?.first_name} {guest?.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{guest?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium">Habitación {room?.number}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                      <div className="text-xs sm:text-sm">
                        <p>{format(new Date(reservation.check_in), 'dd/MM')} - {format(new Date(reservation.check_out), 'dd/MM')}</p>
                        <p className="text-muted-foreground">{reservation.guests_count} huéspedes</p>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Badge className={`${getStatusColor(reservation.status)} text-xs`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
