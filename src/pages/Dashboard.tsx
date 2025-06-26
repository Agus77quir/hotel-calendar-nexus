
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
    }, 800); // Reducido a 800ms para que sea más rápido

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="rounded-md border p-4 bg-green-100 border-green-200 text-green-700"
        >
          ¡Bienvenido, {user?.firstName}!
        </motion.div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de la actividad y estado actual del hotel.
        </p>
      </div>
      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ocupación Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OccupancyChart rooms={rooms} reservations={reservations} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Estado de Habitaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoomStatusChart rooms={rooms} />
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reservas del Día</h2>
        <p className="text-muted-foreground">
          Listado de reservas para el día de hoy.
        </p>
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
