
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
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Calendar, User, MapPin, DollarSign, Eye } from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationQuickActions } from './ReservationQuickActions';
import { ReservationViewModal } from './ReservationViewModal';
import { useState } from 'react';

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
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    guest?: Guest;
    room?: Room;
  }>({ isOpen: false });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="text-xs">Confirmada</Badge>;
      case 'checked-in':
        return <Badge className="bg-green-500 text-xs">Registrado</Badge>;
      case 'checked-out':
        return <Badge variant="secondary" className="text-xs">Check-out</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelada</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
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

  const handleViewReservation = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    if (guest && room) {
      setViewModal({
        isOpen: true,
        reservation,
        guest,
        room
      });
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
    <>
      {/* Mobile Cards View - Visible only on small screens */}
      <div className="block md:hidden space-y-4">
        {reservations.map((reservation) => {
          const guest = guests.find(g => g.id === reservation.guest_id);
          const room = rooms.find(r => r.id === reservation.room_id);
          
          if (!guest || !room) return null;
          
          return (
            <Card key={reservation.id} className="w-full">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header with status and ID */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground font-mono">
                      #{reservation.id.slice(0, 8)}
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                  
                  {/* Guest Info */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {guest.first_name} {guest.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {guest.email}
                      </div>
                      {guest.is_associated && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Asociado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Room Info */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Habitación #{room.number}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {room.type.replace('-', ' ')} • {reservation.guests_count} huésped{reservation.guests_count > 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm">
                        {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })} - {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div className="font-medium text-sm">
                      ${Number(reservation.total_amount).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="pt-2 border-t">
                    <ReservationQuickActions
                      reservation={reservation}
                      guest={guest}
                      room={room}
                      onStatusChange={handleStatusChange}
                      onNewReservation={handleNewReservation}
                    />
                  </div>
                  
                  {/* Edit/Delete Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReservation(reservation)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(reservation)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reservation.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View - Hidden on small screens */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Reserva</TableHead>
              <TableHead className="min-w-[200px]">Huésped</TableHead>
              <TableHead className="min-w-[150px]">Habitación</TableHead>
              <TableHead className="min-w-[100px]">Check-in</TableHead>
              <TableHead className="min-w-[100px]">Check-out</TableHead>
              <TableHead className="min-w-[80px]">Total</TableHead>
              <TableHead className="min-w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[200px]">Acciones Automáticas</TableHead>
              <TableHead className="text-right min-w-[150px]">Gestión</TableHead>
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
                            Asociado
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
                        onClick={() => handleViewReservation(reservation)}
                        title="Ver detalles de la reserva"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

      {/* View Modal */}
      {viewModal.isOpen && viewModal.reservation && viewModal.guest && viewModal.room && (
        <ReservationViewModal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false })}
          reservation={viewModal.reservation}
          guest={viewModal.guest}
          room={viewModal.room}
        />
      )}
    </>
  );
};
