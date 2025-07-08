import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useHotelData } from '@/hooks/useHotelData';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { ReservationFilters } from '@/components/Reservations/ReservationFilters';
import { ReservationsHeader } from '@/components/Reservations/ReservationsHeader';
import { ReservationsSearch } from '@/components/Reservations/ReservationsSearch';
import { ReservationsTable } from '@/components/Reservations/ReservationsTable';
import { Reservation } from '@/types/hotel';

const ReservationsPage = () => {
  const { reservations, guests, rooms, addReservation, updateReservation, deleteReservation, isLoading } = useHotelData();
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
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    const searchLower = searchTerm.toLowerCase();
    
    // Text search filter
    const matchesSearch = (
      guest?.first_name.toLowerCase().includes(searchLower) ||
      guest?.last_name.toLowerCase().includes(searchLower) ||
      guest?.email.toLowerCase().includes(searchLower) ||
      room?.number.includes(searchLower) ||
      reservation.id.includes(searchLower)
    );

    // Date filter
    let matchesDate = true;
    if (dateFilters.dateFrom && dateFilters.dateTo) {
      const checkIn = reservation.check_in;
      const checkOut = reservation.check_out;
      // Check if reservation overlaps with filter date range
      matchesDate = checkIn <= dateFilters.dateTo && checkOut >= dateFilters.dateFrom;
    }

    return matchesSearch && matchesDate;
  });

  const handleSaveReservation = async (reservationData: any) => {
    try {
      if (reservationModal.mode === 'create') {
        await addReservation(reservationData);
        setReservationModal({ isOpen: false, mode: 'create' });
      } else if (reservationModal.reservation) {
        await updateReservation({ id: reservationModal.reservation.id, ...reservationData });
        setReservationModal({ isOpen: false, mode: 'create' });
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };

  const handleDeleteReservation = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      deleteReservation(id);
    }
  };

  const handleNewReservationForGuest = (guestId: string) => {
    setReservationModal({ 
      isOpen: true, 
      mode: 'create',
      preselectedGuestId: guestId
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <CardHeader>
          <ReservationsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={filteredReservations.length}
          />
        </CardHeader>
        <CardContent>
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
