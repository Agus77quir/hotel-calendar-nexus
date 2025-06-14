
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Users, Calendar, DollarSign, BedDouble, Wrench, TrendingUp, Clock } from 'lucide-react';
import { HotelStats } from '@/types/hotel';

interface StatsCardsProps {
  stats: HotelStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;
  
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
      subtitle: 'Fuera de servicio'
    },
    {
      title: 'Check-ins Hoy',
      value: stats.todayCheckIns,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: 'Llegadas esperadas'
    },
    {
      title: 'Check-outs Hoy',
      value: stats.todayCheckOuts,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      subtitle: 'Salidas programadas'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      subtitle: 'Facturación actual'
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
