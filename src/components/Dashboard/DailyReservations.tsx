
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Reservation, Room, Guest } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ReservationsSearch } from '@/components/Reservations/ReservationsSearch';
import { DailyReservationsStats } from './DailyReservationsStats';
import { DailyReservationsList } from './DailyReservationsList';
import { useDailyReservationsFilter } from '@/hooks/useDailyReservationsFilter';

interface DailyReservationsProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  selectedDate: Date;
}

export const DailyReservations = ({ reservations, rooms, guests, selectedDate }: DailyReservationsProps) => {
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const {
    searchTerm,
    setSearchTerm,
    dayReservations,
    filteredReservations,
    checkInsToday,
    checkOutsToday
  } = useDailyReservationsFilter(reservations, rooms, guests, selectedDateStr);

  return (
    <div className="space-y-4">
      <DailyReservationsStats 
        checkInsToday={checkInsToday}
        checkOutsToday={checkOutsToday}
        totalReservations={dayReservations.length}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservas del {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <ReservationsSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              resultCount={filteredReservations.length}
            />
          </div>

          <DailyReservationsList
            reservations={filteredReservations}
            rooms={rooms}
            guests={guests}
            selectedDateStr={selectedDateStr}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
    </div>
  );
};
