
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { useHotelData } from '@/hooks/useHotelData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';

const CalendarPage = () => {
  const { reservations, rooms, guests } = useHotelData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Vista completa del calendario de reservas
          </p>
        </div>
        <BackToHomeButton />
      </div>

      <HotelCalendar 
        reservations={reservations}
        rooms={rooms}
        guests={guests}
      />
    </div>
  );
};

export default CalendarPage;
