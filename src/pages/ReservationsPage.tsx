import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useHotelData } from '@/hooks/useHotelData';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { ReservationFilters } from '@/components/Reservations/ReservationFilters';
import { ReservationsHeader } from '@/components/Reservations/ReservationsHeader';
import { ReservationsSearch } from '@/components/Reservations/ReservationsSearch';
import { ReservationsTable } from '@/components/Reservations/ReservationsTable';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Reservation } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';

const ReservationsPage = () => {
  // Real-time updates are handled automatically in useHotelData
  const { reservations, guests, rooms, addReservation, updateReservation, deleteReservation, isLoading } = useHotelData();
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

  const filteredReservations = reservations.filter(reservation => {
    try {
      if (!reservation) return false;
      
      const guest = guests.find(g => g && g.id === reservation.guest_id);
      const room = rooms.find(r => r && r.id === reservation.room_id);
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Text search filter
      const matchesSearch = searchTerm === '' || (
        (guest?.first_name || '').toLowerCase().includes(searchLower) ||
        (guest?.last_name || '').toLowerCase().includes(searchLower) ||
        (guest?.email || '').toLowerCase().includes(searchLower) ||
        (room?.number || '').toLowerCase().includes(searchLower) ||
        (reservation.id || '').toLowerCase().includes(searchLower)
      );

      // Date filter
      let matchesDate = true;
      if (dateFilters.dateFrom && dateFilters.dateTo && reservation.check_in && reservation.check_out) {
        const checkIn = reservation.check_in;
        const checkOut = reservation.check_out;
        matchesDate = checkIn <= dateFilters.dateTo && checkOut >= dateFilters.dateFrom;
      }

      return matchesSearch && matchesDate;
    } catch (error) {
      console.error('Error filtering reservation:', reservation?.id, error);
      return false;
    }
  });

  const handleSaveReservation = async (reservationData: any) => {
    try {
      let savedReservation;
      
      if (reservationModal.mode === 'create') {
        savedReservation = await addReservation(reservationData);
        
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
      console.error('Error saving reservation:', error);
      
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la reserva. Intenta nuevamente.",
        variant: "destructive",
      });
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
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error al cargar las reservas. Por favor, recarga la página.</p>
        </div>
      }
    >
      <div className="space-y-4 md:space-y-6 p-2 md:p-4">
        <ErrorBoundary>
          <ReservationsHeader
            reservations={reservations || []}
            guests={guests || []}
            rooms={rooms || []}
            onNewReservation={() => setReservationModal({ isOpen: true, mode: 'create' })}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <ReservationFilters
            onFiltersChange={setDateFilters}
            onClearFilters={() => setDateFilters({})}
          />
        </ErrorBoundary>

        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <ErrorBoundary>
              <ReservationsSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredReservations.length}
              />
            </ErrorBoundary>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <ErrorBoundary>
              <ReservationsTable
                reservations={filteredReservations || []}
                guests={guests || []}
                rooms={rooms || []}
                onEdit={(reservation) => setReservationModal({
                  isOpen: true,
                  mode: 'edit',
                  reservation
                })}
                onDelete={handleDeleteReservation}
                onNewReservationForGuest={handleNewReservationForGuest}
                onStatusChange={handleStatusChange}
              />
            </ErrorBoundary>
          </CardContent>
        </Card>

        <ErrorBoundary>
          <ReservationModal
            isOpen={reservationModal.isOpen}
            onClose={() => setReservationModal({ isOpen: false, mode: 'create' })}
            onSave={handleSaveReservation}
            rooms={rooms || []}
            guests={guests || []}
            reservation={reservationModal.reservation}
            mode={reservationModal.mode}
            preselectedGuestId={reservationModal.preselectedGuestId}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ReservationsPage;
