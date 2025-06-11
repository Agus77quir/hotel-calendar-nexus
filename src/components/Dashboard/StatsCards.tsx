
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Users, Calendar, DollarSign, BedDouble, Wrench } from 'lucide-react';
import { HotelStats } from '@/types/hotel';

interface StatsCardsProps {
  stats: HotelStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Habitaciones Totales',
      value: stats.totalRooms,
      icon: Bed,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Habitaciones Ocupadas',
      value: stats.occupiedRooms,
      icon: BedDouble,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Disponibles',
      value: stats.availableRooms,
      icon: Bed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Mantenimiento',
      value: stats.maintenanceRooms,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Check-ins Hoy',
      value: stats.todayCheckIns,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Check-outs Hoy',
      value: stats.todayCheckOuts,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`h-8 w-8 rounded-full ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.title === 'Habitaciones Ocupadas' && stats.totalRooms > 0 && 
                `${Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}% ocupación`
              }
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
