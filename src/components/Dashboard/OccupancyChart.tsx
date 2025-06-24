
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Room, Reservation } from '@/types/hotel';
import { TrendingUp } from 'lucide-react';

interface OccupancyChartProps {
  rooms: Room[];
  reservations: Reservation[];
}

export const OccupancyChart = ({ rooms, reservations }: OccupancyChartProps) => {
  // Generate data for the last 7 days
  const generateOccupancyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count occupied rooms for this date
      const occupiedRooms = reservations.filter(reservation => 
        reservation.check_in <= dateStr && 
        reservation.check_out >= dateStr &&
        reservation.status !== 'cancelled'
      ).length;
      
      const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
      
      data.push({
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        occupancy: occupancyRate,
        occupied: occupiedRooms,
        total: rooms.length
      });
    }
    
    return data;
  };

  const data = generateOccupancyData();

  const chartConfig = {
    occupancy: {
      label: "Ocupación (%)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ocupación de los Últimos 7 Días
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                className="text-xs"
                domain={[0, 100]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.occupied}/${props.payload.total})`,
                      "Ocupación"
                    ]}
                  />
                }
              />
              <Bar
                dataKey="occupancy"
                fill="var(--color-occupancy)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
