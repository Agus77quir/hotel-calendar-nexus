
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { stats, reservations, rooms, guests } = useHotelData();
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* Ahora el calendario se muestra primero */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-0">
        <HotelCalendar 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
        />
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border-0">
        <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-2">
          Bienvenido, {user?.firstName}
        </h1>
        <p className="text-gray-600 text-lg">
          Panel de control del sistema hotelero - Resumen general y actividades del día
        </p>
      </div>

      <StatsCards stats={stats} />
    </div>
  );
};

export default Dashboard;

