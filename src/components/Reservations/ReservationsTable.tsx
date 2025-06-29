
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
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

  return (
    <div className="rounded-md border overflow-hidden">
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
          {reservations.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-6 text-center text-muted-foreground">
                No se encontraron reservas
              </td>
            </tr>
          ) : (
            reservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);

              return (
                <tr key={reservation.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{reservation.id.slice(0, 8)}...</td>
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
