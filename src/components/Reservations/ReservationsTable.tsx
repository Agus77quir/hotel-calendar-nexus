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
import { formatDisplayDate } from '@/utils/dateUtils';
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
  UserCog,
  Users
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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmada</Badge>;
      case 'checked-in':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Check-in</Badge>;
      case 'checked-out':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Check-out</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          No se encontraron reservas que coincidan con los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Huésped
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habitación
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </TableHead>
              <TableHead className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const guest = guests.find(g => g.id === reservation.guest_id);
              const room = rooms.find(r => r.id === reservation.room_id);
              
              if (!guest || !room) return null;

              return (
                <TableRow key={reservation.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {guest.first_name} {guest.last_name}
                          {guest.is_associated && (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{guest.email}</div>
                        <div className="text-xs text-gray-400">{guest.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Habitación #{room.number}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {room.type.replace('-', ' ')} • {reservation.guests_count} huéspedes
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDisplayDate(reservation.check_in)}
                    </div>
                    <div className="text-sm text-gray-500">
                      hasta {formatDisplayDate(reservation.check_out)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(reservation.total_amount).toLocaleString()}
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => handleViewDetails(reservation)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onEdit(reservation)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Reserva
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setEditGuestModal({ isOpen: true, guest })}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Editar Huésped
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onNewReservationForGuest(guest.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Reserva
                        </DropdownMenuItem>

                        {reservation.status === 'confirmed' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-in')}>
                            <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-green-600">Check-in</span>
                          </DropdownMenuItem>
                        )}

                        {reservation.status === 'checked-in' && (
                          <DropdownMenuItem onClick={() => onStatusChange(reservation.id, 'checked-out')}>
                            <LogOut className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-blue-600">Check-out</span>
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
