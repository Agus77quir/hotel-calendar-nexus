
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Wrench, Calendar, Clock, Bed } from 'lucide-react';
import { HotelStats, Room, Reservation, Guest } from '@/types/hotel';

interface ReceptionistStatsCardsProps {
  stats: HotelStats;
  rooms?: Room[];
  reservations?: Reservation[];
  guests?: Guest[];
}

export const ReceptionistStatsCards = ({ stats, rooms = [], reservations = [], guests = [] }: ReceptionistStatsCardsProps) => {
  // Get maintenance room numbers
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');
  const maintenanceRoomNumbers = maintenanceRooms.map(r => r.number).sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  // Only show these specific cards for receptionists
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
      subtitle: 'Actualmente ocupadas'
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
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
