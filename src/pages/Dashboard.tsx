
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { stats, reservations, rooms, guests } = useHotelData();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          Resumen general del hotel y actividades del día
        </p>
      </div>

      <StatsCards stats={stats} />

      <HotelCalendar 
        reservations={reservations}
        rooms={rooms}
        guests={guests}
      />
    </div>
  );
};

export default Dashboard;
