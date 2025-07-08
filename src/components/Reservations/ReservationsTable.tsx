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
import { Edit, Trash2, Download, MessageCircle, Mail, Plus } from 'lucide-react';
import { Reservation, Guest, Room } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateReservationPDF } from '@/services/pdfService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { sendReservationConfirmationAutomatically } from '@/services/automatedEmailService';

interface ReservationsTableProps {
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onNewReservationForGuest?: (guestId: string) => void;
}

export const ReservationsTable = ({
  reservations,
  guests,
  rooms,
  onEdit,
  onDelete,
  onNewReservationForGuest
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

  const handleDownloadPDF = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    if (guest && room) {
      generateReservationPDF(reservation, guest, room);
    }
  };

  const handleSendWhatsApp = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    if (guest && room) {
      sendReservationToWhatsApp(reservation, guest, room);
    }
  };

  const handleSendEmail = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    if (guest && room) {
      sendReservationConfirmationAutomatically(guest, reservation, room);
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
                <TableCell className="font-mono text-sm">
                  {reservation.id}
                </TableCell>
                <TableCell>
                  {guest ? (
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
                  ) : (
                    <span className="text-muted-foreground">Huésped no encontrado</span>
                  )}
                </TableCell>
                <TableCell>
                  {room ? (
                    <div>
                      <div className="font-medium">Habitación {room.number}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {room.type.replace('-', ' ')}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Habitación no encontrada</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {reservation.guests_count}
                </TableCell>
                <TableCell className="font-medium">
                  ${Number(reservation.total_amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(reservation.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendWhatsApp(reservation)}
                      title="Enviar por WhatsApp"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNewReservation(reservation.guest_id)}
                      title="Nueva reserva para este huésped"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendEmail(reservation)}
                      title="Confirmar por Email"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadPDF(reservation)}
                      title="Descargar PDF"
                    >
                      <Download className="h-4 w-4" />
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
  );
};
