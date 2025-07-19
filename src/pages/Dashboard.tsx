
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

  // ENHANCED AUTO-REFRESH: More frequent updates for critical dashboard data
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 DASHBOARD: Enhanced auto-refresh triggered every 5 seconds');
      forceRefresh();
    }, 5000); // Reduced from 10 to 5 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [forceRefresh]);

  // IMMEDIATE REFRESH: Additional refresh when component mounts or data changes
  useEffect(() => {
    console.log('🔄 DASHBOARD: Component mounted or data changed, triggering immediate refresh');
    forceRefresh();
  }, []);

  // Get current date
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = new Date(); // Add selectedDate for DailyReservations
  
  // Current guests (checked-in)
  const currentGuests = reservations.filter(r => r.status === 'checked-in');
  
  // Today's activities - REAL-TIME CALCULATIONS
  const todayCheckIns = reservations.filter(r => 
    r.check_in === today && r.status === 'confirmed'
  );
  
  const todayCheckOuts = reservations.filter(r => 
    r.check_out === today && r.status === 'checked-in'
  );

  // Room status breakdown - REAL-TIME CALCULATIONS
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
            Vista general del hotel • Actualización automática cada 5s • Tiempo real activado
          </p>
        </div>
        <Button
          onClick={forceRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar Ahora
        </Button>
      </div>

      {/* ENHANCED Real-time status indicators with live data */}
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
        <Badge variant="outline" className="text-gray-600 border-gray-600">
          <RefreshCw className="h-3 w-3 mr-1" />
          Última actualización: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* ENHANCED Debug Card with real-time verification */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Estado del Sistema - Tiempo Real Activo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <strong>Reservas (LIVE):</strong>
              <div>Total: {reservations.length}</div>
              <div>Confirmadas: {reservations.filter(r => r.status === 'confirmed').length}</div>
              <div>Registradas: {reservations.filter(r => r.status === 'checked-in').length}</div>
              <div>Finalizadas: {reservations.filter(r => r.status === 'checked-out').length}</div>
            </div>
            <div>
              <strong>Habitaciones (LIVE):</strong>
              <div>Total: {rooms.length}</div>
              <div>Disponibles: {roomStatusCount.available}</div>
              <div>Ocupadas: {roomStatusCount.occupied}</div>
              <div>Mantenimiento: {roomStatusCount.maintenance}</div>
            </div>
            <div>
              <strong>Hoy (LIVE):</strong>
              <div>Check-ins: {todayCheckIns.length}</div>
              <div>Check-outs: {todayCheckOuts.length}</div>
              <div>Huéspedes: {currentGuests.length}</div>
            </div>
            <div>
              <strong>Sistema:</strong>
              <div>Huéspedes: {guests.length}</div>
              <div>Auto-refresh: 5s</div>
              <div>Tiempo real: Activo</div>
              <div>Última actualización: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      
      {/* Receptionist specific stats */}
      <ReceptionistStatsCards 
        stats={stats}
        rooms={rooms} 
        reservations={reservations} 
        guests={guests} 
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomStatusChart rooms={rooms} />
        <OccupancyChart rooms={rooms} reservations={reservations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
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
