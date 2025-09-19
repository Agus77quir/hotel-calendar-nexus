
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarDays, User, Search } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';

interface DailyReservationsCardProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  selectedDate: Date;
}

export const DailyReservationsCard = ({ reservations, rooms, guests, selectedDate }: DailyReservationsCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    console.log('📅 Buscando reservas para fecha:', dateStr);
    console.log('📊 Total reservas disponibles:', reservations.length);
    
    const filtered = reservations.filter(reservation => {
      const checkIn = reservation.check_in;
      const checkOut = reservation.check_out;
      
      // Una reserva está activa si:
      // - La fecha seleccionada es mayor o igual al check-in
      // - La fecha seleccionada es menor al check-out
      // - O si es el mismo día del check-out (para mostrar check-outs del día)
      const isActive = (dateStr >= checkIn && dateStr < checkOut) || 
                       (dateStr === checkOut);
      
      console.log(`Reserva ${reservation.id}: ${checkIn} - ${checkOut}, Activa: ${isActive}`);
      
      return isActive;
    });
    
    console.log('✅ Reservas encontradas para la fecha:', filtered.length);
    return filtered;
  };

  const selectedDateReservations = getReservationsForDate(selectedDate);

  const displayedReservations = useMemo(() => {
    const baseReservations = searchTerm.trim() ? reservations : selectedDateReservations;
    
    if (!searchTerm.trim()) return baseReservations;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return baseReservations.filter(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const room = rooms.find(r => r.id === reservation.room_id);
      
      if (!guest) return false;
      
      const guestFullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
      const guestEmail = guest.email.toLowerCase();
      const roomNumber = room?.number || '';
      const reservationId = reservation.id.toLowerCase();
      
      return (
        guest.first_name.toLowerCase().includes(searchLower) ||
        guest.last_name.toLowerCase().includes(searchLower) ||
        guestFullName.includes(searchLower) ||
        guestEmail.includes(searchLower) ||
        roomNumber.includes(searchLower) ||
        reservationId.includes(searchLower)
      );
    });
  }, [searchTerm, reservations, selectedDateReservations, guests, rooms]);

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
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800">
          {searchTerm.trim() ? 'Resultados de búsqueda' : `Reservas para ${format(selectedDate, 'dd MMMM yyyy', { locale: es })}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por huésped, email, habitación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <div className="text-sm text-muted-foreground mt-2">
              {displayedReservations.length} reservas encontradas
            </div>
          )}
        </div>

        {displayedReservations.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron reservas que coincidan con la búsqueda' : 'No hay reservas para esta fecha'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayedReservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);
              const isCheckIn = format(new Date(reservation.check_in), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const isCheckOut = format(new Date(reservation.check_out), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
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
  );
};
