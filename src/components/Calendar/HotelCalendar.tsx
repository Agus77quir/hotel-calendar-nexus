
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface HotelCalendarProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onAddReservation?: () => void;
}

export const HotelCalendar = ({ reservations, rooms, guests, onAddReservation }: HotelCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);
      return date >= checkIn && date <= checkOut;
    });
  };

  const selectedDateReservations = getReservationsForDate(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendario de Reservas
          </CardTitle>
          {onAddReservation && (
            <Button onClick={onAddReservation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
            className="rounded-md border"
            modifiers={{
              hasReservations: (date) => getReservationsForDate(date).length > 0,
            }}
            modifiersStyles={{
              hasReservations: {
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Reservas para {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateReservations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay reservas para esta fecha
            </p>
          ) : (
            <div className="space-y-4">
              {selectedDateReservations.map((reservation) => {
                const guest = guests.find(g => g.id === reservation.guest_id);
                const room = rooms.find(r => r.id === reservation.room_id);
                const isCheckIn = isSameDay(new Date(reservation.check_in), selectedDate);
                const isCheckOut = isSameDay(new Date(reservation.check_out), selectedDate);

                return (
                  <div key={reservation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {guest?.first_name} {guest?.last_name}
                        </h4>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusText(reservation.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Habitación {room?.number}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Check-in: {format(new Date(reservation.check_in), 'dd/MM/yyyy')}
                        {isCheckIn && <Badge variant="outline" className="ml-2">Hoy</Badge>}
                      </p>
                      <p>
                        Check-out: {format(new Date(reservation.check_out), 'dd/MM/yyyy')}
                        {isCheckOut && <Badge variant="outline" className="ml-2">Hoy</Badge>}
                      </p>
                      <p>Huéspedes: {reservation.guests_count}</p>
                      <p>Total: ${reservation.total_amount}</p>
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
