
import { useEffect } from 'react';
import { useHotelData } from '@/hooks/useHotelData';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { stats, rooms, reservations, guests, isLoading, forceRefresh } = useHotelData();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 DASHBOARD: Auto-refresh triggered');
      forceRefresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [forceRefresh]);

  // Get current date
  const today = new Date().toISOString().split('T')[0];
  
  // Current guests (checked-in)
  const currentGuests = reservations.filter(r => r.status === 'checked-in');
  
  // Today's activities
  const todayCheckIns = reservations.filter(r => 
    r.check_in === today && r.status === 'confirmed'
  );
  
  const todayCheckOuts = reservations.filter(r => 
    r.check_out === today && r.status === 'checked-in'
  );

  // Room status breakdown
  const roomStatusCount = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando sistema automatizado...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with manual refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Vista general del hotel • Actualización automática cada 10s
          </p>
        </div>
        <Button
          onClick={forceRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Real-time status indicators */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {currentGuests.length} Huéspedes Actuales
        </Badge>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          {todayCheckIns.length} Check-ins Hoy
        </Badge>
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          <Clock className="h-3 w-3 mr-1" />
          {todayCheckOuts.length} Check-outs Hoy
        </Badge>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {roomStatusCount.occupied} Habitaciones Ocupadas
        </Badge>
      </div>

      {/* Debug Card - Temporary for verification */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Estado del Sistema - Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <strong>Reservas:</strong>
              <div>Total: {reservations.length}</div>
              <div>Confirmadas: {reservations.filter(r => r.status === 'confirmed').length}</div>
              <div>Registradas: {reservations.filter(r => r.status === 'checked-in').length}</div>
              <div>Finalizadas: {reservations.filter(r => r.status === 'checked-out').length}</div>
            </div>
            <div>
              <strong>Habitaciones:</strong>
              <div>Total: {rooms.length}</div>
              <div>Disponibles: {roomStatusCount.available}</div>
              <div>Ocupadas: {roomStatusCount.occupied}</div>
              <div>Mantenimiento: {roomStatusCount.maintenance}</div>
            </div>
            <div>
              <strong>Hoy:</strong>
              <div>Check-ins: {todayCheckIns.length}</div>
              <div>Check-outs: {todayCheckOuts.length}</div>
              <div>Huéspedes: {currentGuests.length}</div>
            </div>
            <div>
              <strong>Sistema:</strong>
              <div>Huéspedes: {guests.length}</div>
              <div>Última actualización: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <StatsCards stats={stats} />
      
      {/* Receptionist specific stats */}
      <ReceptionistStatsCards 
        rooms={rooms} 
        reservations={reservations} 
        guests={guests} 
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomStatusChart rooms={rooms} />
        <OccupancyChart reservations={reservations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart reservations={reservations} />
        <DailyReservations reservations={reservations} />
      </div>
    </div>
  );
};

export default Dashboard;
