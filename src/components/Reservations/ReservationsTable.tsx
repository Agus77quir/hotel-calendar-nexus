
import { useState } from 'react';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Room, Guest, Reservation } from '@/types/hotel';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Percent
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationViewModal } from './ReservationViewModal';
import { GuestModal } from '../Guests/GuestModal';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onNewReservationForGuest: (guestId: string) => void;
  onStatusChange: (reservationId: string, status: Reservation['status']) => void;
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

  const [guestModal, setGuestModal] = useState<{
    isOpen: boolean;
    guest?: Guest;
  }>({ isOpen: false });

  const getGuest = (guestId: string) => guests.find(g => g.id === guestId);
  const getRoom = (roomId: string) => rooms.find(r => r.id === roomId);

  const statusColors = {
    'confirmed': 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-green-100 text-green-800',
    'checked-out': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    'confirmed': 'Confirmada',
    'checked-in': 'Check-in',
    'checked-out': 'Check-out',
    'cancelled': 'Cancelada'
  };

  const handleViewReservation = (reservation: Reservation) => {
    const guest = getGuest(reservation.guest_id);
    const room = getRoom(reservation.room_id);
    
    if (guest && room) {
      setViewModal({
        isOpen: true,
        reservation,
        guest,
        room
      });
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setViewModal({ isOpen: false });
    setGuestModal({
      isOpen: true,
      guest
    });
  };

  const handleSaveGuest = async (guestData: any) => {
    // Esta función será implementada por el componente padre
    console.log('Guardando datos del huésped:', guestData);
    setGuestModal({ isOpen: false });
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No hay reservas</h3>
        <p>Cuando se creen reservas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Reserva</TableHead>
              <TableHead className="min-w-[180px]">Huésped</TableHead>
              <TableHead className="min-w-[100px]">Habitación</TableHead>
              <TableHead className="min-w-[140px]">Check-in</TableHead>
              <TableHead className="min-w-[140px]">Check-out</TableHead>
              <TableHead className="min-w-[80px]">Huéspedes</TableHead>
              <TableHead className="min-w-[100px]">Total</TableHead>
              <TableHead className="min-w-[120px]">Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const guest = getGuest(reservation.guest_id);
              const room = getRoom(reservation.room_id);
              
              if (!guest || !room) return null;

              return (
                <TableRow key={reservation.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>#{reservation.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reservation.created_at), 'dd/MM/yy', { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {guest.first_name} {guest.last_name}
                        </span>
                        {guest.is_associated && (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Asociado
                            </Badge>
                            {guest.discount_percentage > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Percent className="h-3 w-3" />
                                <span className="text-xs">{guest.discount_percentage}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {guest.email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {guest.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">#{room.number}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {room.type.replace('-', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{reservation.guests_count}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">${reservation.total_amount}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={statusColors[reservation.status]}>
                      {statusLabels[reservation.status]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewReservation(reservation)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onEdit(reservation)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar reserva
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onNewReservationForGuest(reservation.guest_id)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Nueva reserva para huésped
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {reservation.status === 'confirmed' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-in')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Check-in
                          </DropdownMenuItem>
                        )}
                        
                        {reservation.status === 'checked-in' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-out')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                            Check-out
                          </DropdownMenuItem>
                        )}
                        
                        {(reservation.status === 'confirmed' || reservation.status === 'checked-in') && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'cancelled')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => onDelete(reservation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal de vista de reserva */}
      {viewModal.isOpen && viewModal.reservation && viewModal.guest && viewModal.room && (
        <ReservationViewModal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false })}
          reservation={viewModal.reservation}
          guest={viewModal.guest}
          room={viewModal.room}
          onEditGuest={handleEditGuest}
        />
      )}

      {/* Modal de edición de huésped */}
      <GuestModal
        isOpen={guestModal.isOpen}
        onClose={() => setGuestModal({ isOpen: false })}
        onSave={handleSaveGuest}
        guest={guestModal.guest}
        mode="edit"
      />
    </>
  );
};
