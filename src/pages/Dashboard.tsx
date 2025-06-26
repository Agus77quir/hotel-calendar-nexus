
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Bed, TrendingUp, Calendar, User, MapPin } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { reservations, guests, rooms, stats, isLoading } = useHotelData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del hotel
          </p>
        </div>
        <ReportExportButtons 
          reservations={reservations}
          guests={guests}
          rooms={rooms}
        />
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart reservations={reservations} rooms={rooms} />
        <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservas Diarias
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextDay}>
                    →
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyReservations 
                reservations={reservations}
                rooms={rooms}
                guests={guests}
                selectedDate={selectedDate}
              />
            </CardContent>
          </Card>
        </div>
        
        <RoomStatusChart rooms={rooms} />
      </div>
    </div>
  );
};

export default Dashboard;
