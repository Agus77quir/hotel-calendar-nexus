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
import { MultiReservationViewModal } from './MultiReservationViewModal';
import { EditGuestModal } from '../Guests/EditGuestModal';
import { MultiRoomReservationModal } from '../Guests/MultiRoomReservationModal';
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
  Users,
  CalendarDays,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { openEmailClient, openMultipleReservationEmailClient } from '@/services/emailTemplateService';
import { sendReservationToWhatsApp } from '@/services/whatsappService';
import { sendMultipleReservationToWhatsAppSanitized } from '@/services/whatsappSanitized';

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
  const { updateGuest, addReservation } = useHotelData();
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    guest?: Guest;
    room?: Room;
  }>({
    isOpen: false,
  });

  const [multiViewModal, setMultiViewModal] = useState<{
    isOpen: boolean;
    reservations?: Reservation[];
    guest?: Guest;
  }>({
    isOpen: false,
  });

  const [editGuestModal, setEditGuestModal] = useState<{
    isOpen: boolean;
    guest?: Guest;
  }>({
    isOpen: false,
  });

  const [multiRoomModal, setMultiRoomModal] = useState<{
    isOpen: boolean;
    guest?: Guest;
  }>({
    isOpen: false,
  });

  const isAdmin = user?.role === 'admin';

  const groupReservations = (reservations: Reservation[]) => {
    const grouped: { [key: string]: Reservation[] } = {};
    
    reservations.forEach(reservation => {
      const key = `${reservation.guest_id}-${reservation.check_in}-${reservation.check_out}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(reservation);
    });
    
    return Object.values(grouped);
  };

  const groupedReservations = groupReservations(reservations);

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

  const handleViewMultiDetails = (reservationGroup: Reservation[]) => {
    const guest = guests.find(g => g.id === reservationGroup[0].guest_id);
    
    if (guest) {
      setMultiViewModal({
        isOpen: true,
        reservations: reservationGroup,
        guest,
      });
    }
  };

  const handleSendEmail = (reservationGroup: Reservation[], guest: Guest) => {
    console.log('=== EMAIL BUTTON CLICKED FROM TABLE ===');
    console.log('Reservation group length:', reservationGroup.length);
    console.log('Guest:', guest.first_name, guest.last_name);
    
    if (reservationGroup.length > 1) {
      // Es una reserva múltiple
      console.log('Sending MULTIPLE reservation email');
      openMultipleReservationEmailClient(guest, reservationGroup, rooms);
      toast({
        title: "Email enviado",
        description: `Confirmación de reservas múltiples enviada a ${guest.email}`,
      });
    } else {
      // Es una reserva simple
      console.log('Sending SINGLE reservation email');
      const reservation = reservationGroup[0];
      const room = rooms.find(r => r.id === reservation.room_id);
      if (room) {
        openEmailClient(guest, reservation, room);
        toast({
          title: "Email enviado",
          description: `Confirmación enviada a ${guest.email}`,
        });
      }
    }
  };

  const handleSendWhatsApp = (reservationGroup: Reservation[], guest: Guest) => {
    console.log('=== WHATSAPP BUTTON CLICKED FROM TABLE ===');
    console.log('Reservation group length:', reservationGroup.length);
    console.log('Guest:', guest.first_name, guest.last_name);
    
    if (reservationGroup.length > 1) {
      // Es una reserva múltiple
      console.log('Sending MULTIPLE reservation WhatsApp');
      sendMultipleReservationToWhatsAppSanitized(reservationGroup, guest, rooms);
      toast({
        title: "WhatsApp enviado",
        description: `Mensaje de reservas múltiples enviado a ${guest.phone}`,
      });
    } else {
      // Es una reserva simple
      console.log('Sending SINGLE reservation WhatsApp');
      const reservation = reservationGroup[0];
      const room = rooms.find(r => r.id === reservation.room_id);
      if (room) {
        sendReservationToWhatsApp(reservation, guest, room);
        toast({
          title: "WhatsApp enviado",
          description: `Mensaje enviado a ${guest.phone}`,
        });
      }
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

  const handleMultiRoomReservations = async (reservationsData: any[]) => {
    try {
      for (const reservationData of reservationsData) {
        await addReservation(reservationData);
      }
    } catch (error) {
      throw error;
    }
  };

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
                Habitación(es)
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
            {groupedReservations.map((reservationGroup, groupIndex) => {
              const firstReservation = reservationGroup[0];
              const guest = guests.find(g => g.id === firstReservation.guest_id);
              
              if (!guest) return null;

              const isMultipleRooms = reservationGroup.length > 1;
              const totalAmount = reservationGroup.reduce((sum, res) => sum + Number(res.total_amount), 0);
              const totalGuests = reservationGroup.reduce((sum, res) => sum + res.guests_count, 0);

              return (
                <TableRow key={`group-${groupIndex}`} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {guest.first_name} {guest.last_name}
                          {guest.is_associated && (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                          {isMultipleRooms && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Múltiple
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{guest.email}</div>
                        <div className="text-xs text-gray-400">{guest.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {isMultipleRooms ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {reservationGroup.length} Habitaciones
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservationGroup.map(res => {
                            const room = rooms.find(r => r.id === res.room_id);
                            return room ? `#${room.number}` : '';
                          }).filter(Boolean).join(', ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {totalGuests} huéspedes total
                        </div>
                      </div>
                    ) : (
                      <div>
                        {(() => {
                          const room = rooms.find(r => r.id === firstReservation.room_id);
                          return room ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                Habitación #{room.number}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {room.type.replace('-', ' ')} • {firstReservation.guests_count} huéspedes
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDisplayDate(firstReservation.check_in)}
                    </div>
                    <div className="text-sm text-gray-500">
                      hasta {formatDisplayDate(firstReservation.check_out)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {isMultipleRooms ? (
                      <div className="space-y-1">
                        {reservationGroup.map((res, idx) => (
                          <div key={idx}>
                            {getStatusBadge(res.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      getStatusBadge(firstReservation.status)
                    )}
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${totalAmount.toLocaleString()}
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
                        {isMultipleRooms ? (
                          <>
                            <DropdownMenuItem onClick={() => handleViewMultiDetails(reservationGroup)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setEditGuestModal({ isOpen: true, guest })}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Editar Huésped
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleSendEmail(reservationGroup, guest)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>

                            {guest.phone && (
                              <DropdownMenuItem onClick={() => handleSendWhatsApp(reservationGroup, guest)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar WhatsApp
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => onNewReservationForGuest(guest.id)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Nueva Reserva
                            </DropdownMenuItem>

                            {isAdmin && (
                              <DropdownMenuItem onClick={() => setMultiRoomModal({ isOpen: true, guest })}>
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Reserva Múltiple
                              </DropdownMenuItem>
                            )}

                            {reservationGroup.map((reservation, idx) => (
                              <DropdownMenuItem 
                                key={idx}
                                onClick={() => onDelete(reservation.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Hab. #{rooms.find(r => r.id === reservation.room_id)?.number}
                              </DropdownMenuItem>
                            ))}
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => handleViewDetails(firstReservation)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => onEdit(firstReservation)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Reserva
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setEditGuestModal({ isOpen: true, guest })}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Editar Huésped
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleSendEmail([firstReservation], guest)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>

                            {guest.phone && (
                              <DropdownMenuItem onClick={() => handleSendWhatsApp([firstReservation], guest)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar WhatsApp
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => onNewReservationForGuest(guest.id)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Nueva Reserva
                            </DropdownMenuItem>

                            {isAdmin && (
                              <DropdownMenuItem onClick={() => setMultiRoomModal({ isOpen: true, guest })}>
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Reserva Múltiple
                              </DropdownMenuItem>
                            )}

                            {firstReservation.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => onStatusChange(firstReservation.id, 'checked-in')}>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                <span className="text-green-600">Check-in</span>
                              </DropdownMenuItem>
                            )}

                            {firstReservation.status === 'checked-in' && (
                              <DropdownMenuItem onClick={() => onStatusChange(firstReservation.id, 'checked-out')}>
                                <LogOut className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="text-blue-600">Check-out</span>
                              </DropdownMenuItem>
                            )}

                            {(firstReservation.status === 'confirmed' || firstReservation.status === 'checked-in') && (
                              <DropdownMenuItem onClick={() => onStatusChange(firstReservation.id, 'cancelled')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Cancelar</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem 
                              onClick={() => onDelete(firstReservation.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
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
          onEdit={() => {
            setViewModal({ isOpen: false });
            onEdit(viewModal.reservation!);
          }}
        />
      )}

      {multiViewModal.isOpen && multiViewModal.reservations && multiViewModal.guest && (
        <MultiReservationViewModal
          isOpen={multiViewModal.isOpen}
          onClose={() => setMultiViewModal({ isOpen: false })}
          reservations={multiViewModal.reservations}
          guest={multiViewModal.guest}
          rooms={rooms}
          onEdit={(reservationId) => {
            const reservation = multiViewModal.reservations?.find(r => r.id === reservationId);
            if (reservation) {
              setMultiViewModal({ isOpen: false });
              onEdit(reservation);
            }
          }}
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

      {multiRoomModal.isOpen && multiRoomModal.guest && (
        <MultiRoomReservationModal
          isOpen={multiRoomModal.isOpen}
          onClose={() => setMultiRoomModal({ isOpen: false })}
          guest={multiRoomModal.guest}
          rooms={rooms}
          onCreateReservations={handleMultiRoomReservations}
        />
      )}
    </>
  );
};
