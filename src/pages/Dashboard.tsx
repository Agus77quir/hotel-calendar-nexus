
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bed, CalendarDays, TrendingUp, CheckCircle } from 'lucide-react';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { RoomStatusIndicator } from '@/components/Dashboard/RoomStatusIndicator';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { useAuth } from '@/contexts/AuthContext';
import { useHotelData } from '@/hooks/useHotelData';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { rooms, guests, reservations, stats, isLoading } = useHotelData();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedDate] = useState(new Date());

  const isReceptionist = user?.role === 'receptionist';

  // Enhanced logging for debugging room status updates
  useEffect(() => {
    console.log('=== DASHBOARD ROOM STATUS DEBUG ===');
    console.log('Total rooms loaded:', rooms.length);
    console.log('Room statuses breakdown:', {
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length
    });
    console.log('Occupied rooms details:', rooms.filter(r => r.status === 'occupied').map(r => ({
      id: r.id,
      number: r.number,
      status: r.status
    })));
    console.log('All reservations:', reservations.map(r => ({
      id: r.id,
      room_id: r.room_id,
      status: r.status,
      check_in: r.check_in,
      check_out: r.check_out
    })));
    console.log('Checked-in reservations:', reservations.filter(r => r.status === 'checked-in'));
    console.log('=== END DEBUG ===');
  }, [rooms, reservations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced auto-refresh with more frequent updates for room status
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Dashboard auto-refresh triggered - forcing data update');
      // Force refresh of queries to ensure real-time updates
      window.location.reload();
    }, 15000); // Refresh every 15 seconds for better real-time updates

    return () => clearInterval(interval);
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
          Resumen de la actividad y estado actual del hotel. Los datos se actualizan automáticamente cada 15 segundos.
        </p>
        
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
          Debug: {rooms.filter(r => r.status === 'occupied').length} habitaciones ocupadas, 
          {reservations.filter(r => r.status === 'checked-in').length} reservas con check-in realizado
        </div>
      </div>
      
      {isReceptionist ? (
        <ReceptionistStatsCards stats={stats} rooms={rooms} />
      ) : (
        <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      )}
      
      {!isReceptionist && (
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
            <RoomStatusChart rooms={rooms} />
          </Card>
        </div>
      )}
      
      {/* Nueva sección para mostrar el estado detallado de habitaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Estado Detallado de Habitaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoomStatusIndicator rooms={rooms} />
          </CardContent>
        </Card>
        
        <div className="space-y-2 sm:space-y-4">
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
