
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Users, Calendar, DollarSign, BedDouble, Wrench, TrendingUp, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { HotelStats, Room, Reservation } from '@/types/hotel';

interface StatsCardsProps {
  stats: HotelStats;
  rooms?: Room[];
  reservations?: Reservation[];
}

export const StatsCards = ({ stats, rooms = [], reservations = [] }: StatsCardsProps) => {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;
  
  // Calcular métricas correctamente con fecha actual
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyRevenue = reservations
    .filter(r => r.created_at?.slice(0, 7) === thisMonth && r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  // CONTADORES CORREGIDOS - Check-ins programados para hoy (confirmados + los que ya están registrados)
  const todayCheckIns = reservations.filter(r => {
    const checkIn = r.check_in;
    const isToday = checkIn === today;
    // Incluir tanto confirmadas como las ya registradas para el conteo total
    const isRelevant = r.status === 'confirmed' || r.status === 'checked-in';
    return isToday && isRelevant;
  });

  // Check-outs programados para hoy (registrados + los que ya hicieron check-out)
  const todayCheckOuts = reservations.filter(r => {
    const checkOut = r.check_out;
    const isToday = checkOut === today;
    // Incluir tanto registradas como las que ya hicieron check-out para el conteo total
    const isRelevant = r.status === 'checked-in' || r.status === 'checked-out';
    return isToday && isRelevant;
  });

  // Check-ins COMPLETADOS hoy (solo los que cambiaron a checked-in hoy)
  const todayCheckedIn = reservations.filter(r => {
    const checkIn = r.check_in;
    const isToday = checkIn === today;
    const isCompleted = r.status === 'checked-in';
    return isToday && isCompleted;
  });

  // Check-outs COMPLETADOS hoy (solo los que cambiaron a checked-out hoy)
  const todayCheckedOut = reservations.filter(r => {
    const checkOut = r.check_out;
    const isToday = checkOut === today;
    const isCompleted = r.status === 'checked-out';
    return isToday && isCompleted;
  });

  // Get maintenance room numbers
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
  const maintenanceRoomNumbers = maintenanceRooms.map(r => r.number).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  // Log mejorado para debugging de las tarjetas
  console.log('🔄 TARJETAS ACTUALIZADAS - Check-ins/Check-outs de hoy:', {
    fecha: today,
    checkIns: {
      completados: todayCheckedIn.length,
      programados: todayCheckIns.length,
      porcentaje: todayCheckIns.length > 0 ? Math.round((todayCheckedIn.length / todayCheckIns.length) * 100) : 0
    },
    checkOuts: {
      completados: todayCheckedOut.length,
      programados: todayCheckOuts.length,
      porcentaje: todayCheckOuts.length > 0 ? Math.round((todayCheckedOut.length / todayCheckOuts.length) * 100) : 0
    },
    reservaciones: reservations.map(r => ({
      id: r.id.slice(-4),
      checkIn: r.check_in,
      checkOut: r.check_out,
      status: r.status
    })),
    timestamp: new Date().toLocaleTimeString()
  });

  const cards = [
    {
      title: 'Habitaciones Totales',
      value: stats.totalRooms,
      icon: Bed,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: 'Total disponible'
    },
    {
      title: 'Habitaciones Ocupadas',
      value: stats.occupiedRooms,
      icon: BedDouble,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: `${occupancyRate}% ocupación`
    },
    {
      title: 'Disponibles',
      value: stats.availableRooms,
      icon: Bed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      subtitle: 'Listas para reservar'
    },
    {
      title: 'Mantenimiento',
      value: stats.maintenanceRooms,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: stats.maintenanceRooms > 0 
        ? `Hab. ${maintenanceRoomNumbers.join(', ')}` 
        : 'Ninguna en mantenimiento'
    },
    {
      title: 'Check-ins Hoy',
      value: `${todayCheckedIn.length}/${todayCheckIns.length}`,
      icon: ArrowRight,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      subtitle: todayCheckIns.length === 0 
        ? 'Sin check-ins programados'
        : `${todayCheckedIn.length} completados de ${todayCheckIns.length} esperados`
    },
    {
      title: 'Check-outs Hoy',
      value: `${todayCheckedOut.length}/${todayCheckOuts.length}`,
      icon: ArrowLeft,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      subtitle: todayCheckOuts.length === 0
        ? 'Sin check-outs programados'
        : `${todayCheckedOut.length} completados de ${todayCheckOuts.length} programados`
    },
    {
      title: 'Ingresos del Mes',
      value: `$${monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      subtitle: 'Facturación mensual'
    },
    {
      title: 'Tasa de Ocupación',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      subtitle: occupancyRate > 80 ? 'Excelente' : occupancyRate > 60 ? 'Buena' : 'Mejorable'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{card.title}</CardTitle>
            <div className={`h-10 w-10 rounded-full ${card.bgColor} flex items-center justify-center shadow-sm`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">{card.value}</div>
            <p className="text-xs text-gray-500">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
