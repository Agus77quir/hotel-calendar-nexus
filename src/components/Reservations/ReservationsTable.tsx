
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Room, Guest, Reservation } from '@/types/hotel';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

export const ReservationsTable = ({
  reservations,
  guests,
  rooms,
  onEdit,
  onDelete
}: ReservationsTableProps) => {
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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron reservas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="py-3 px-4 text-left font-medium">ID</th>
              <th className="py-3 px-4 text-left font-medium">Huésped</th>
              <th className="py-3 px-4 text-left font-medium">Habitación</th>
              <th className="py-3 px-4 text-left font-medium">Check-in</th>
              <th className="py-3 px-4 text-left font-medium">Check-out</th>
              <th className="py-3 px-4 text-left font-medium">Estado</th>
              <th className="py-3 px-4 text-left font-medium">Total</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);

              return (
                <tr key={reservation.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{reservation.id}</td>
                  <td className="py-3 px-4">
                    {guest ? `${guest.first_name} ${guest.last_name}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">{room?.number || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="py-3 px-4">
                    {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusText(reservation.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">${reservation.total_amount}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit(reservation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(reservation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {reservations.map((reservation) => {
          const guest = guests.find(g => g.id === reservation.guest_id);
          const room = rooms.find(r => r.id === reservation.room_id);

          return (
            <div key={reservation.id} className="border rounded-lg p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {guest ? `${guest.first_name} ${guest.last_name}` : 'N/A'}
                  </span>
                </div>
                <Badge className={`${getStatusColor(reservation.status)} text-xs`}>
                  {getStatusText(reservation.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">{reservation.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Habitación</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">{room?.number || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="font-bold text-lg">${reservation.total_amount}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(reservation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(reservation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
