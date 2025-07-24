
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { RoomStatusChart } from '@/components/Dashboard/RoomStatusChart';
import { OccupancyChart } from '@/components/Dashboard/OccupancyChart';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { DailyReservationsCard } from '@/components/Dashboard/DailyReservationsCard';

const Dashboard = () => {
  const { stats, rooms, reservations, guests, isLoading } = useHotelData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando panel de control...</div>
      </div>
    );
  }

  // Calcular datos en tiempo real
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date();
  
  const currentGuests = reservations.filter(r => 
    r.status === 'checked-in' && 
    r.check_in <= today && 
    r.check_out >= today
  );
  
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;

  console.log('📊 DASHBOARD - Estado actual:', {
    today,
    currentGuests: currentGuests.length,
    totalReservations: reservations.length
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Actualizaciones automáticas en tiempo real
        </p>
      </div>

      {/* Indicadores en tiempo real */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {currentGuests.length} En Hotel
        </Badge>
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {occupiedRooms} Habitaciones Ocupadas
        </Badge>
      </div>

      {/* Stats Cards principales */}
      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      
      {/* Stats Cards para recepcionistas */}
      <ReceptionistStatsCards 
        stats={stats}
        rooms={rooms} 
        reservations={reservations} 
        guests={guests} 
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomStatusChart rooms={rooms} />
        <OccupancyChart rooms={rooms} reservations={reservations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart reservations={reservations} rooms={rooms} guests={guests} />
        <DailyReservationsCard 
          reservations={reservations} 
          rooms={rooms} 
          guests={guests} 
          selectedDate={todayDate}
        />
      </div>

      {/* Estado del sistema simplificado */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            SISTEMA OPTIMIZADO - Actualizaciones en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              <div>Disponibles: {rooms.filter(r => r.status === 'available').length}</div>
              <div>Ocupadas: {occupiedRooms}</div>
              <div>Mantenimiento: {rooms.filter(r => r.status === 'maintenance').length}</div>
            </div>
            <div>
              <strong>Sistema:</strong>
              <div>Huéspedes: {guests.length}</div>
              <div>Tiempo real: ✅ ACTIVO</div>
              <div>Estado: ✅ OPTIMIZADO</div>
              <div>En hotel: {currentGuests.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
