
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Reservation } from '@/types/hotel';

interface DailyReservationsStatsProps {
  checkInsToday: Reservation[];
  checkOutsToday: Reservation[];
  totalReservations: number;
}

export const DailyReservationsStats = ({ 
  checkInsToday, 
  checkOutsToday, 
  totalReservations 
}: DailyReservationsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Check-ins Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{checkInsToday.length}</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Check-outs Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{checkOutsToday.length}</div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Reservas Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalReservations}</div>
        </CardContent>
      </Card>
    </div>
  );
};
