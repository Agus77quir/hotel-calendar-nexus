
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bed, CalendarDays, TrendingUp, CheckCircle } from 'lucide-react';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { useAuth } from '@/contexts/AuthContext';
import { useHotelData } from '@/hooks/useHotelData';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { rooms, guests, reservations, stats, isLoading } = useHotelData();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedDate] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="rounded-md border p-3 sm:p-4 bg-green-100 border-green-200 text-green-700 text-sm sm:text-base"
        >
          ¡Bienvenido, {user?.firstName}!
        </motion.div>
      )}
      
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Resumen de la actividad y estado actual del hotel.
        </p>
      </div>
      
      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Ocupación Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <OccupancyChart rooms={rooms} reservations={reservations} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bed className="h-4 w-4 sm:h-5 sm:w-5" />
              Estado de Habitaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <RoomStatusChart rooms={rooms} />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Reservas del Día</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Listado de reservas para el día de hoy.
          </p>
        </div>
        <DailyReservations 
          reservations={reservations} 
          rooms={rooms} 
          guests={guests} 
          selectedDate={selectedDate} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
