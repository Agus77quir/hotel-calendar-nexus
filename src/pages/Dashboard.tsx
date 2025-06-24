
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { StatsCards } from '@/components/Dashboard/StatsCards';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { useHotelData } from '@/hooks/useHotelData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Dashboard = () => {
  const { rooms, guests, reservations, stats, isLoading } = useHotelData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  // Transform reservations for calendar
  const calendarEvents = reservations.map(reservation => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    
    return {
      id: reservation.id,
      title: `${guest?.first_name} ${guest?.last_name} - Hab. ${room?.number}`,
      start: new Date(reservation.check_in + 'T14:00:00'),
      end: new Date(reservation.check_out + 'T12:00:00'),
      resource: {
        ...reservation,
        guestName: `${guest?.first_name} ${guest?.last_name}`,
        roomNumber: room?.number,
      }
    };
  });

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.status) {
      case 'confirmed':
        backgroundColor = '#3b82f6';
        break;
      case 'checked-in':
        backgroundColor = '#10b981';
        break;
      case 'checked-out':
        backgroundColor = '#6b7280';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <OccupancyChart rooms={rooms} reservations={reservations} />
        <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
        <RoomStatusChart rooms={rooms} />
      </div>

      {/* Calendar and Daily Reservations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendario de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
                  onSelectEvent={(event) => setSelectedDate(event.start)}
                  selectable
                  culture="es"
                  messages={{
                    next: 'Siguiente',
                    previous: 'Anterior',
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay eventos en este rango',
                    showMore: (total) => `+ Ver más (${total})`
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Reservations */}
        <div>
          <DailyReservations
            reservations={reservations}
            rooms={rooms}
            guests={guests}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
