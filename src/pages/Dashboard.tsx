
import { useEffect, useState } from 'react';
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
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp when data changes - AUTOMATIC DETECTION
  useEffect(() => {
    setLastUpdate(new Date());
    console.log('📊 DASHBOARD: Data updated automatically');
  }, [reservations, rooms]);

  // Get current date
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = new Date();
  
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
        <div className="text-lg">Cargando panel de control...</div>
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
            Actualizaciones automáticas en tiempo real • Última: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={() => {
            forceRefresh();
            setLastUpdate(new Date());
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar Manualmente
        </Button>
      </div>

      {/* Real-time status indicators */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {currentGuests.length} En Hotel
        </Badge>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          {todayCheckIns.length} Llegan Hoy
        </Badge>
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          <Clock className="h-3 w-3 mr-1" />
          {todayCheckOuts.length} Salen Hoy
        </Badge>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {roomStatusCount.occupied} Habitaciones Ocupadas
        </Badge>
      </div>

      {/* Main Stats - These will update automatically */}
      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      
      {/* Receptionist specific stats */}
      <ReceptionistStatsCards 
        stats={stats}
        rooms={rooms} 
        reservations={reservations} 
        guests={guests} 
      />

      {/* Charts Grid - All will update automatically */}
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

      {/* System Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            SISTEMA EN TIEMPO REAL ACTIVO - Actualizaciones Automáticas
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
              <div>En hotel: {currentGuests.length}</div>
            </div>
            <div>
              <strong>Sistema:</strong>
              <div>Huéspedes: {guests.length}</div>
              <div>Tiempo real: ✅ ACTIVO</div>
              <div>Auto-actualización: ✅ ON</div>
              <div>Última: {lastUpdate.toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
