import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, User } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface HotelCalendarProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onAddReservation?: () => void;
  onDateSelect?: (date: Date) => void;
}

export const HotelCalendar = ({ reservations, rooms, guests, onAddReservation, onDateSelect }: HotelCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

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

  const getGuestColor = (guestId: string) => {
    // Generate consistent colors based on guest ID
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-lime-100 text-lime-800 border-lime-200',
    ];
    
    // Simple hash function to get consistent color for guest
    let hash = 0;
    for (let i = 0; i < guestId.length; i++) {
      hash = guestId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <CalendarDays className="h-5 w-5" />
            Calendario de Reservas
          </CardTitle>
          {onAddReservation && (
            <Button onClick={onAddReservation} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={es}
            className="rounded-md border bg-white/50"
            modifiers={{
              hasReservations: (date) => getReservationsForDate(date).length > 0,
            }}
            modifiersStyles={{
              hasReservations: {
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontWeight: 'bold',
                borderRadius: '6px',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Reservas para {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateReservations.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay reservas para esta fecha</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedDateReservations.map((reservation) => {
                const guest = guests.find(g => g.id === reservation.guest_id);
                const room = rooms.find(r => r.id === reservation.room_id);
                const isCheckIn = isSameDay(new Date(reservation.check_in), selectedDate);
                const isCheckOut = isSameDay(new Date(reservation.check_out), selectedDate);
                const guestColorClass = getGuestColor(reservation.guest_id);

                return (
                  <div key={reservation.id} className="p-4 border rounded-lg bg-white/70 hover:bg-white/90 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium text-gray-800">
                            {guest?.first_name} {guest?.last_name}
                          </h4>
                        </div>
                        <Badge className={`${guestColorClass} border`}>
                          Huésped
                        </Badge>
                        <Badge className={`${getStatusColor(reservation.status)} border`}>
                          {getStatusText(reservation.status)}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        Habitación {room?.number}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Check-in:</span> 
                          {format(new Date(reservation.check_in), 'dd/MM/yyyy')}
                          {isCheckIn && <Badge variant="outline" className="text-xs">Hoy</Badge>}
                        </p>
                        <p className="flex items-center gap-2 mt-1">
                          <span className="font-medium">Check-out:</span> 
                          {format(new Date(reservation.check_out), 'dd/MM/yyyy')}
                          {isCheckOut && <Badge variant="outline" className="text-xs">Hoy</Badge>}
                        </p>
                      </div>
                      <div>
                        <p><span className="font-medium">Huéspedes:</span> {reservation.guests_count}</p>
                        <p className="mt-1"><span className="font-medium">Total:</span> <span className="text-green-600 font-semibold">${reservation.total_amount}</span></p>
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
