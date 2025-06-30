
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useHotelData } from '@/hooks/useHotelData';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { ReservationFilters } from '@/components/Reservations/ReservationFilters';
import { GuestModal } from '@/components/Guests/GuestModal';
import { ReservationsHeader } from '@/components/Reservations/ReservationsHeader';
import { ReservationsSearch } from '@/components/Reservations/ReservationsSearch';
import { ReservationsTable } from '@/components/Reservations/ReservationsTable';
import { ReservationConfirmationModal } from '@/components/Reservations/ReservationConfirmationModal';
import { Reservation } from '@/types/hotel';

const ReservationsPage = () => {
  const { reservations, guests, rooms, addReservation, updateReservation, deleteReservation, addGuest, isLoading } = useHotelData();
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
  }>({
    isOpen: false,
    mode: 'create',
  });
  const [guestModal, setGuestModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit',
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
  }>({
    isOpen: false,
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
      let newReservation;
      
      if (reservationModal.mode === 'create') {
        newReservation = await addReservation(reservationData);
        // Close the reservation modal
        setReservationModal({ isOpen: false, mode: 'create' });
        
        // Show confirmation modal
        setConfirmationModal({
          isOpen: true,
          reservation: newReservation
        });
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

  const handleSaveGuestFromReservations = async (guestData: any) => {
    await addGuest(guestData);
    setGuestModal({ isOpen: false, mode: 'create' });
  };

  const getConfirmationData = () => {
    if (!confirmationModal.reservation) return null;
    
    const guest = guests.find(g => g.id === confirmationModal.reservation?.guest_id);
    const room = rooms.find(r => r.id === confirmationModal.reservation?.room_id);
    
    return { guest, room };
  };

  const confirmationData = getConfirmationData();

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
        onNewGuest={() => setGuestModal({ isOpen: true, mode: 'create' })}
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
      />

      <GuestModal
        isOpen={guestModal.isOpen}
        onClose={() => setGuestModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveGuestFromReservations}
        mode={guestModal.mode}
      />

      {confirmationModal.isOpen && confirmationModal.reservation && confirmationData?.guest && confirmationData?.room && (
        <ReservationConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ isOpen: false })}
          reservation={confirmationModal.reservation}
          guest={confirmationData.guest}
          room={confirmationData.room}
        />
      )}
    </div>
  );
};

export default ReservationsPage;
