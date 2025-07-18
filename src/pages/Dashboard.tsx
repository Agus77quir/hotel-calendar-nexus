
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bed, CalendarDays, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
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
  const { rooms, guests, reservations, stats, isLoading, forceRefresh } = useHotelData();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedDate] = useState(new Date());

  const isReceptionist = user?.role === 'receptionist';

  // Detailed logging and verification
  useEffect(() => {
    console.log('=== DASHBOARD REAL-TIME STATUS ===');
    console.log('Current timestamp:', new Date().toISOString());
    console.log('Total rooms loaded:', rooms.length);
    
    const roomStatusBreakdown = {
      available: rooms.filter(r => r.status === 'available').length,
      occupied: rooms.filter(r => r.status === 'occupied').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      cleaning: rooms.filter(r => r.status === 'cleaning').length
    };
    
    console.log('Room statuses breakdown:', roomStatusBreakdown);
    
    const reservationStatusBreakdown = {
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      'checked-in': reservations.filter(r => r.status === 'checked-in').length,
      'checked-out': reservations.filter(r => r.status === 'checked-out').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length
    };
    
    console.log('Reservation statuses breakdown:', reservationStatusBreakdown);
    
    // Detailed room analysis
    console.log('Occupied rooms details:', rooms
      .filter(r => r.status === 'occupied')
      .map(r => ({
        id: r.id,
        number: r.number,
        status: r.status
      }))
    );
    
    // Check-in reservations analysis
    const checkedInReservations = reservations.filter(r => r.status === 'checked-in');
    console.log('Checked-in reservations:', checkedInReservations.map(r => ({
      id: r.id,
      room_id: r.room_id,
      status: r.status,
      check_in: r.check_in,
      check_out: r.check_out
    })));
    
    // Cross-reference check
    console.log('Room/Reservation Cross-Reference:');
    checkedInReservations.forEach(reservation => {
      const room = rooms.find(r => r.id === reservation.room_id);
      console.log(`Reservation ${reservation.id} -> Room ${room?.number} (${room?.id}) = ${room?.status}`);
    });
    
    console.log('=== END DASHBOARD STATUS ===');
  }, [rooms, reservations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh with more aggressive timing
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 Dashboard auto-refresh triggered');
      await forceRefresh();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [forceRefresh]);

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

  // Real-time status indicators
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');
  const checkedInReservations = reservations.filter(r => r.status === 'checked-in');
  const todayCheckIns = reservations.filter(r => 
    r.check_in === new Date().toISOString().split('T')[0] && r.status === 'confirmed'
  );
  const todayCheckOuts = reservations.filter(r => 
    r.check_out === new Date().toISOString().split('T')[0] && r.status === 'checked-in'
  );

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
          Resumen de la actividad y estado actual del hotel. Actualización automática cada 10 segundos.
        </p>
      </div>

      {/* Real-time Status Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Habitaciones Ocupadas</p>
                <p className="text-2xl font-bold text-blue-900">{occupiedRooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Huéspedes Actuales</p>
                <p className="text-2xl font-bold text-green-900">{checkedInReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Check-ins Hoy</p>
                <p className="text-2xl font-bold text-orange-900">{todayCheckIns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Check-outs Hoy</p>
                <p className="text-2xl font-bold text-purple-900">{todayCheckOuts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Status Card - for verification (temporary) */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            Estado del Sistema (Debug)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>🏠 Total habitaciones: {rooms.length}</p>
          <p>🔴 Habitaciones ocupadas: {occupiedRooms.length} (habitaciones: {occupiedRooms.map(r => r.number).join(', ') || 'ninguna'})</p>
          <p>👥 Reservas con check-in: {checkedInReservations.length}</p>
          <p>📅 Check-ins pendientes hoy: {todayCheckIns.length}</p>
          <p>🚪 Check-outs programados hoy: {todayCheckOuts.length}</p>
          <p>🕒 Última actualización: {new Date().toLocaleTimeString()}</p>
        </CardContent>
      </Card>
      
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
      
      {/* Detailed Room Status Section */}
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
