
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { HotelStats, Room, Reservation, Guest } from '@/types/hotel';

interface ReceptionistStatsCardsProps {
  stats: HotelStats;
  rooms: Room[];
  reservations: Reservation[];
  guests: Guest[];
}

export const ReceptionistStatsCards = ({ stats, rooms, reservations, guests }: ReceptionistStatsCardsProps) => {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;
  
  // Calcular métricas
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = reservations
    .filter(r => r.created_at?.slice(0, 7) === thisMonth && r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  const cards = [
    {
      title: 'Ingresos del Mes',
      value: `$${monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: 'Facturación mensual'
    },
    {
      title: 'Tasa de Ocupación',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: occupancyRate > 80 ? 'Excelente' : occupancyRate > 60 ? 'Buena' : 'Mejorable'
    },
    {
      title: 'Total Huéspedes',
      value: guests.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: 'Registrados en sistema'
    },
    {
      title: 'Reservas Activas',
      value: reservations.filter(r => r.status === 'confirmed' || r.status === 'checked-in').length,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: 'Confirmadas y activas'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
