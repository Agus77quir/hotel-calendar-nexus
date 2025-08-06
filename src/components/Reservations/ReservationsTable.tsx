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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Calendar,
  User,
  MapPin,
  DollarSign,
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationViewModal } from './ReservationViewModal';
import { GuestModal } from '@/components/Guests/GuestModal';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onNewReservationForGuest: (guestId: string) => void;
  onStatusChange: (reservationId: string, newStatus: Reservation['status']) => void;
  onSaveGuest: (guestData: any) => void;
}

export const ReservationsTable = ({
  reservations,
  guests,
  rooms,
  onEdit,
  onDelete,
  onNewReservationForGuest,
  onStatusChange,
  onSaveGuest,
}: ReservationsTableProps) => {
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    guest?: Guest;
    room?: Room;
  }>({
    isOpen: false,
  });

  const [guestModal, setGuestModal] = useState<{
    isOpen: boolean;
    guest?: Guest;
  }>({
    isOpen: false,
  });

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

  const canCheckIn = (status: Reservation['status']) => {
    return status === 'confirmed';
  };

  const canCheckOut = (status: Reservation['status']) => {
    return status === 'checked-in';
  };

  const canCancel = (status: Reservation['status']) => {
    return status === 'confirmed';
  };

  const handleViewReservation = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    if (guest && room) {
      setViewModal({
        isOpen: true,
        reservation,
        guest,
        room,
      });
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setViewModal({ isOpen: false });
    setGuestModal({
      isOpen: true,
      guest,
    });
  };

  const handleSaveGuest = async (guestData: any) => {
    try {
      await onSaveGuest(guestData);
      setGuestModal({ isOpen: false });
    } catch (error) {
      console.error('Error saving guest:', error);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay reservas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva reserva.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Huésped</TableHead>
              <TableHead>Habitación</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Huéspedes</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);
              
              return (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {guest ? `${guest.first_name} ${guest.last_name}` : 'Huésped no encontrado'}
                        </div>
                        {guest?.email && (
                          <div className="text-sm text-gray-500">{guest.email}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">#{room?.number || 'N/A'}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {room?.type.replace('-', ' ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  
                  <TableCell>
                    {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      {reservation.guests_count}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="font-medium">${Number(reservation.total_amount).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReservation(reservation)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(reservation)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar reserva
                        </DropdownMenuItem>
                        {guest && (
                          <DropdownMenuItem onClick={() => onNewReservationForGuest(guest.id)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Nueva reserva para huésped
                          </DropdownMenuItem>
                        )}
                        {canCheckIn(reservation.status) && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-in')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Check-in
                          </DropdownMenuItem>
                        )}
                        {canCheckOut(reservation.status) && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-out')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Check-out
                          </DropdownMenuItem>
                        )}
                        {canCancel(reservation.status) && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'cancelled')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDelete(reservation.id)}
                          className="text-red-600"
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
