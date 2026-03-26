import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useHotelData } from '@/hooks/useHotelData';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { ReservationFilters } from '@/components/Reservations/ReservationFilters';
import { ReservationsHeader } from '@/components/Reservations/ReservationsHeader';
import { ReservationsSearch } from '@/components/Reservations/ReservationsSearch';
import { ReservationsTable } from '@/components/Reservations/ReservationsTable';
import { Reservation } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

const ReservationsPage = () => {
  // Real-time updates are handled automatically in useHotelData
  const { reservations, guests, rooms, addReservation, updateReservation, deleteReservation, isLoading } = useHotelData({
    guests: true,
    rooms: true,
    reservations: true,
    reservationGroups: false,
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilters, setDateFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    filterType?: 'custom' | 'week' | 'month';
  }>({});
  const [reservationModal, setReservationModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    reservation?: Reservation;
    preselectedGuestId?: string;
  }>({
    isOpen: false,
    mode: 'create',
  });

  const guestsById = useMemo(
    () => new Map(guests.map((guest) => [guest.id, guest])),
    [guests]
  );

  const roomsById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room])),
    [rooms]
  );

  const filteredReservations = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const guest = guestsById.get(reservation.guest_id);
      const room = roomsById.get(reservation.room_id);

      const matchesSearch = !searchLower || (
        (guest?.first_name || '').toLowerCase().includes(searchLower) ||
        (guest?.last_name || '').toLowerCase().includes(searchLower) ||
        (guest?.email || '').toLowerCase().includes(searchLower) ||
        (room?.number || '').toLowerCase().includes(searchLower) ||
        reservation.id.toLowerCase().includes(searchLower)
      );

      if (!dateFilters.dateFrom || !dateFilters.dateTo) {
        return matchesSearch;
      }

      const matchesDate = reservation.check_in <= dateFilters.dateTo && reservation.check_out >= dateFilters.dateFrom;
      return matchesSearch && matchesDate;
    });
  }, [reservations, guestsById, roomsById, searchTerm, dateFilters]);

  const handleSaveReservation = async (reservationData: any) => {
    try {
      console.log('💾 GUARDANDO RESERVA EN PÁGINA:', reservationData);
      
      if (reservationModal.mode === 'create') {
        await addReservation(reservationData);
        
        toast({
          title: "Reserva creada exitosamente",
          description: "La reserva ha sido guardada correctamente",
        });
        
        setReservationModal({ isOpen: false, mode: 'create' });
      } else if (reservationModal.reservation) {
        await updateReservation({ id: reservationModal.reservation.id, ...reservationData });
        
        toast({
          title: "Reserva actualizada",
          description: "La reserva ha sido actualizada exitosamente",
        });
        
        setReservationModal({ isOpen: false, mode: 'create' });
      }
    } catch (error: any) {
      console.error('❌ ERROR GUARDANDO RESERVA EN PÁGINA:', error);
      
      // Mostrar mensaje de error específico
      const errorMessage = error.message || 'Error desconocido';
      if (errorMessage.includes('no_overlapping_reservations')) {
        toast({
          title: "Habitación no disponible",
          description: "La habitación ya está reservada para estas fechas.",
        });
      } else if (errorMessage.includes('invalid_dates')) {
        toast({
          title: "Fechas inválidas",
          description: "Verifique las fechas de check-in y check-out.",
        });
      } else {
        toast({
          title: "No se pudo guardar",
          description: "Verifique los datos e intente nuevamente.",
        });
      }
    }
  };

  const handleDeleteReservation = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const guest = reservation ? guests.find(g => g.id === reservation.guest_id) : null;
    
    const confirmMessage = guest 
      ? `¿Estás seguro de que quieres eliminar la reserva de ${guest.first_name} ${guest.last_name}?`
      : '¿Estás seguro de que quieres eliminar esta reserva?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await deleteReservation(id);
        toast({
          title: "Reserva eliminada",
          description: "La reserva ha sido eliminada exitosamente",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la reserva. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await updateReservation({ id: reservationId, status: newStatus });
      
      const statusText = {
        'confirmed': 'confirmada',
        'checked-in': 'registrada (check-in)',
        'checked-out': 'finalizada (check-out)',
        'cancelled': 'cancelada'
      }[newStatus];
      
      toast({
        title: "Estado actualizado",
        description: `La reserva ha sido ${statusText} exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la reserva",
        variant: "destructive",
      });
    }
  };

  const handleNewReservationForGuest = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      toast({
        title: "Nueva reserva",
        description: `Creando reserva para ${guest.first_name} ${guest.last_name}`,
      });
    }
    
    setReservationModal({ 
      isOpen: true, 
      mode: 'create',
      preselectedGuestId: guestId
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando sistema automatizado...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      <ReservationsHeader
        reservations={reservations}
        guests={guests}
        rooms={rooms}
        onNewReservation={() => setReservationModal({ isOpen: true, mode: 'create' })}
      />

      <ReservationFilters
        onFiltersChange={setDateFilters}
        onClearFilters={() => setDateFilters({})}
      />

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <ReservationsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={filteredReservations.length}
          />
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <ReservationsTable
            reservations={filteredReservations}
            guests={guests}
            rooms={rooms}
            onEdit={(reservation) => setReservationModal({
              isOpen: true,
              mode: 'edit',
              reservation
            })}
            onDelete={handleDeleteReservation}
            onNewReservationForGuest={handleNewReservationForGuest}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      <ReservationModal
        isOpen={reservationModal.isOpen}
        onClose={() => setReservationModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveReservation}
        rooms={rooms}
        guests={guests}
        reservation={reservationModal.reservation}
        mode={reservationModal.mode}
        preselectedGuestId={reservationModal.preselectedGuestId}
      />
    </div>
  );
};

export default ReservationsPage;
