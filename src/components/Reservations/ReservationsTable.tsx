
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationQuickActions } from './ReservationQuickActions';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onNewReservationForGuest?: (guestId: string) => void;
  onStatusChange?: (reservationId: string, newStatus: Reservation['status']) => void;
}

export const ReservationsTable = ({
  reservations,
  guests,
  rooms,
  onEdit,
  onDelete,
  onNewReservationForGuest,
  onStatusChange
}: ReservationsTableProps) => {
  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmada</Badge>;
      case 'checked-in':
        return <Badge className="bg-green-500">Registrado</Badge>;
      case 'checked-out':
        return <Badge variant="secondary">Check-out</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    if (onStatusChange) {
      await onStatusChange(reservationId, newStatus);
    }
  };

  const handleNewReservation = (guestId: string) => {
    if (onNewReservationForGuest) {
      onNewReservationForGuest(guestId);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay reservas para mostrar
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reserva</TableHead>
            <TableHead>Huésped</TableHead>
            <TableHead>Habitación</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones Automáticas</TableHead>
            <TableHead className="text-right">Gestión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => {
            const guest = guests.find(g => g.id === reservation.guest_id);
            const room = rooms.find(r => r.id === reservation.room_id);
            
            if (!guest || !room) return null;
            
            return (
              <TableRow key={reservation.id}>
                <TableCell className="font-mono text-sm">
                  {reservation.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {guest.first_name} {guest.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {guest.email}
                      {guest.is_associated && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Asociado {guest.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">#{room.number}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {room.type.replace('-', ' ')} • {reservation.guests_count} huésped{reservation.guests_count > 1 ? 'es' : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell className="font-medium">
                  ${Number(reservation.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(reservation.status)}
                </TableCell>
                <TableCell>
                  <ReservationQuickActions
                    reservation={reservation}
                    guest={guest}
                    room={room}
                    onStatusChange={handleStatusChange}
                    onNewReservation={handleNewReservation}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(reservation)}
                      title="Editar reserva"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reservation.id)}
                      title="Eliminar reserva"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
