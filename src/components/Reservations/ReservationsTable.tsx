
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus,
  MapPin,
  Calendar as CalendarIcon,
  User as UserIcon
} from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { ReservationViewModal } from './ReservationViewModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onNewReservationForGuest: (guestId: string) => void;
  onStatusChange: (reservationId: string, newStatus: Reservation['status']) => void;
  onGuestUpdate?: (guestId: string, guestData: any) => Promise<Guest>;
}

export const ReservationsTable = ({
  reservations,
  guests,
  rooms,
  onEdit,
  onDelete,
  onNewReservationForGuest,
  onStatusChange,
  onGuestUpdate
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
        return <Badge variant="default" className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Confirmada</Badge>;
      case 'checked-in':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Registrado</Badge>;
      case 'checked-out':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Check-out</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleView = (reservation: Reservation) => {
    if (!reservation?.id) return;
    
    const guest = guests.find(g => g?.id === reservation.guest_id);
    const room = rooms.find(r => r?.id === reservation.room_id);
    
    if (guest && room) {
      setViewModal({
        isOpen: true,
        reservation,
        guest,
        room
      });
    }
  };

  const handleGuestUpdate = async (updatedGuestData: any) => {
    if (onGuestUpdate && viewModal.guest?.id) {
      const updatedGuest = await onGuestUpdate(viewModal.guest.id, updatedGuestData);
      
      // Update the modal state with the updated guest
      setViewModal(prev => ({
        ...prev,
        guest: updatedGuest
      }));
    }
  };

  const getStatusActions = (reservation: Reservation) => {
    const actions = [];
    
    if (!reservation?.status) return actions;
    
    switch (reservation.status) {
      case 'confirmed':
        actions.push({
          label: 'Check-in',
          action: () => onStatusChange(reservation.id, 'checked-in'),
          icon: <CheckCircle className="w-4 h-4" />
        });
        break;
      case 'checked-in':
        actions.push({
          label: 'Check-out',
          action: () => onStatusChange(reservation.id, 'checked-out'),
          icon: <XCircle className="w-4 h-4" />
        });
        break;
    }
    
    if (reservation.status !== 'cancelled') {
      actions.push({
        label: 'Cancelar',
        action: () => onStatusChange(reservation.id, 'cancelled'),
        icon: <XCircle className="w-4 h-4" />,
        destructive: true
      });
    }
    
    return actions;
  };

  // Filter out any null/undefined reservations
  const validReservations = reservations.filter(reservation => 
    reservation && reservation.id
  );

  if (validReservations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No hay reservas</CardTitle>
          <p className="text-muted-foreground text-center">
            No se encontraron reservas que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Huésped
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Habitación
                </div>
              </TableHead>
              <TableHead className="font-semibold">Fechas</TableHead>
              <TableHead className="font-semibold">Huéspedes</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validReservations.map((reservation) => {
              if (!reservation?.id) return null;
              
              const guest = guests.find(g => g?.id === reservation.guest_id);
              const room = rooms.find(r => r?.id === reservation.room_id);
              const statusActions = getStatusActions(reservation);

              return (
                <TableRow key={reservation.id} className="hover:bg-muted/30">
                  <TableCell>
                    {guest ? (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {guest.first_name || ''} {guest.last_name || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {guest.email || guest.phone || ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Huésped no encontrado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {room ? (
                      <div className="space-y-1">
                        <div className="font-medium">#{room.number || ''}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {room.type?.replace('-', ' ') || ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Habitación no encontrada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {reservation.check_in && (
                        <div className="text-sm">
                          <span className="text-green-600">Entrada: </span>
                          {format(new Date(reservation.check_in), 'dd/MM/yy', { locale: es })}
                        </div>
                      )}
                      {reservation.check_out && (
                        <div className="text-sm">
                          <span className="text-red-600">Salida: </span>
                          {format(new Date(reservation.check_out), 'dd/MM/yy', { locale: es })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {reservation.guests_count || 0}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ${Number(reservation.total_amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(reservation)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" title="Más opciones">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => onEdit(reservation)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar Reserva
                          </DropdownMenuItem>
                          
                          {guest && (
                            <DropdownMenuItem
                              onClick={() => onNewReservationForGuest(guest.id)}
                              className="flex items-center gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Nueva Reserva para {guest.first_name || 'Huésped'}
                            </DropdownMenuItem>
                          )}
                          
                          {statusActions.map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={action.action}
                              className={`flex items-center gap-2 ${action.destructive ? 'text-destructive focus:text-destructive' : ''}`}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                          
                          <DropdownMenuItem
                            onClick={() => onDelete(reservation.id)}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar Reserva
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }).filter(Boolean)}
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
          onGuestUpdate={handleGuestUpdate}
        />
      )}
    </>
  );
};
