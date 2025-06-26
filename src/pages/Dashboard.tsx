import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bed, CalendarDays, TrendingUp, CheckCircle } from 'lucide-react';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1500); // Reducido de 3000ms a 1500ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="rounded-md border p-4 bg-green-100 border-green-200 text-green-700"
        >
          ¡Bienvenido, {user?.name}!
        </motion.div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de la actividad y estado actual del hotel.
        </p>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ocupación Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OccupancyChart />
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
            <RevenueChart />
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
            <RoomStatusChart />
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reservas del Día</h2>
        <p className="text-muted-foreground">
          Listado de reservas para el día de hoy.
        </p>
        <DailyReservations />
      </div>
    </div>
  );
};

export default Dashboard;
