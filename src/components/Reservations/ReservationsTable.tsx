
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReservationViewModal } from './ReservationViewModal';
import { EditGuestModal } from '../Guests/EditGuestModal';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal, 
  UserCheck, 
  UserX,
  Clock,
  CheckCircle,
  LogOut,
  XCircle,
  UserEdit
} from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { useToast } from '@/hooks/use-toast';

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
  onStatusChange,
}: ReservationsTableProps) => {
  const { updateGuest } = useHotelData();
  const { toast } = useToast();
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    guest?: Guest;
    room?: Room;
  }>({
    isOpen: false,
  });

  const [editGuestModal, setEditGuestModal] = useState<{
    isOpen: boolean;
    guest?: Guest;
  }>({
    isOpen: false,
  });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-500">Confirmada</Badge>;
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

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="h-4 w-4" />;
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />;
      case 'checked-out':
        return <LogOut className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
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

  const handleEditGuest = async (updatedGuestData: Partial<Guest>) => {
    if (!editGuestModal.guest) return;
    
    try {
      await updateGuest({ id: editGuestModal.guest.id, ...updatedGuestData });
      toast({
        title: "Huésped actualizado",
        description: "Los datos del huésped se han actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el huésped",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg mb-4">No hay reservas que mostrar</p>
        <p className="text-sm text-muted-foreground">
          Las reservas aparecerán aquí una vez que sean creadas
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Huésped</TableHead>
              <TableHead className="font-semibold">Habitación</TableHead>
              <TableHead className="font-semibold">Check-in</TableHead>
              <TableHead className="font-semibold">Check-out</TableHead>
              <TableHead className="font-semibold">Huéspedes</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);
              
              if (!guest || !room) return null;

              return (
                <TableRow key={reservation.id} className="hover:bg-muted/25">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">
                          {guest.first_name} {guest.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {guest.email}
                        </div>
                      </div>
                      {guest.is_associated && (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">#{room.number}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {room.type.replace('-', ' ')}
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
                      {getStatusIcon('confirmed')}
                      <span>{reservation.guests_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${Number(reservation.total_amount).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewDetails(reservation)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onEdit(reservation)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Reserva
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setEditGuestModal({ isOpen: true, guest })}>
                          <UserEdit className="h-4 w-4 mr-2" />
                          Editar Huésped
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onNewReservationForGuest(guest.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Reserva
                        </DropdownMenuItem>

                        {reservation.status === 'confirmed' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-in')}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Check-in
                          </DropdownMenuItem>
                        )}

                        {reservation.status === 'checked-in' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-out')}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Check-out
                          </DropdownMenuItem>
                        )}

                        {(reservation.status === 'confirmed' || reservation.status === 'checked-in') && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'cancelled')}>
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Cancelar</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem 
                          onClick={() => onDelete(reservation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
        />
      )}

      {editGuestModal.isOpen && editGuestModal.guest && (
        <EditGuestModal
          isOpen={editGuestModal.isOpen}
          onClose={() => setEditGuestModal({ isOpen: false })}
          guest={editGuestModal.guest}
          onSave={handleEditGuest}
        />
      )}
    </>
  );
};
