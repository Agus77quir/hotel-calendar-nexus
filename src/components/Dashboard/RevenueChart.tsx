
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Reservation, Room, Guest } from '@/types/hotel';
import { DollarSign } from 'lucide-react';

interface RevenueChartProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
}

export const RevenueChart = ({ reservations, rooms }: RevenueChartProps) => {
  // Generate revenue data for the last 30 days
  const generateRevenueData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate revenue for reservations that were active on this date
      const dayRevenue = reservations
        .filter(reservation => 
          reservation.check_in <= dateStr && 
          reservation.check_out >= dateStr &&
          reservation.status !== 'cancelled'
        )
        .reduce((sum, reservation) => {
          const room = rooms.find(r => r.id === reservation.room_id);
          if (room) {
            // Calculate daily rate
            const checkIn = new Date(reservation.check_in);
            const checkOut = new Date(reservation.check_out);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            const dailyRate = nights > 0 ? Number(reservation.total_amount) / nights : 0;
            return sum + dailyRate;
          }
          return sum;
        }, 0);
      
      data.push({
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        revenue: Math.round(dayRevenue),
        fullDate: dateStr
      });
    }
    
    return data;
  };

  const data = generateRevenueData();
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailyRevenue = Math.round(totalRevenue / data.length);

  const chartConfig = {
    revenue: {
      label: "Ingresos ($)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Ingresos Últimos 30 Días
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Promedio diario: ${avgDailyRevenue}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                className="text-xs"
                interval="preserveStartEnd"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                className="text-xs"
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`$${value}`, "Ingresos"]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
