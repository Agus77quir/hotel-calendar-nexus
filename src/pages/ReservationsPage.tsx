
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { ReservationFilters } from '@/components/Reservations/ReservationFilters';
import { GuestModal } from '@/components/Guests/GuestModal';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'checked-in':
        return 'Registrado';
      case 'checked-out':
        return 'Check-out';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleSaveReservation = (reservationData: any) => {
    if (reservationModal.mode === 'create') {
      addReservation(reservationData);
    } else if (reservationModal.reservation) {
      updateReservation(reservationModal.reservation.id, reservationData);
    }
  };

  const handleDeleteReservation = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      deleteReservation(id);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservas del hotel
          </p>
        </div>
        <div className="flex gap-2">
          <BackToHomeButton />
          <Button
            variant="outline"
            onClick={() => setGuestModal({ isOpen: true, mode: 'create' })}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Huésped
          </Button>
          <Button
            onClick={() => setReservationModal({ isOpen: true, mode: 'create' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <ReservationFilters
        onFiltersChange={setDateFilters}
        onClearFilters={() => setDateFilters({})}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar reservas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredReservations.length} reservas encontradas
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="py-3 px-4 text-left font-medium">ID</th>
                  <th className="py-3 px-4 text-left font-medium">Huésped</th>
                  <th className="py-3 px-4 text-left font-medium">Habitación</th>
                  <th className="py-3 px-4 text-left font-medium">Check-in</th>
                  <th className="py-3 px-4 text-left font-medium">Check-out</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-left font-medium">Total</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const guest = guests.find(g => g.id === reservation.guest_id);
                    const room = rooms.find(r => r.id === reservation.room_id);

                    return (
                      <tr key={reservation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{reservation.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">
                          {guest ? `${guest.first_name} ${guest.last_name}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">{room?.number || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">${reservation.total_amount}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setReservationModal({
                                isOpen: true,
                                mode: 'edit',
                                reservation
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteReservation(reservation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
        onSave={addGuest}
        mode={guestModal.mode}
      />
    </div>
  );
};

export default ReservationsPage;
