
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Room } from '@/types/hotel';
import { Home } from 'lucide-react';

interface RoomStatusChartProps {
  rooms: Room[];
}

export const RoomStatusChart = ({ rooms }: RoomStatusChartProps) => {
  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusLabels = {
    available: 'Disponibles',
    occupied: 'Ocupadas',
    maintenance: 'Mantenimiento',
    cleaning: 'Limpieza'
  };

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
    status: status
  }));

  const COLORS = {
    available: '#10b981',
    occupied: '#3b82f6',
    maintenance: '#f59e0b',
    cleaning: '#8b5cf6'
  };

  const chartConfig = {
    available: {
      label: "Disponibles",
      color: COLORS.available,
    },
    occupied: {
      label: "Ocupadas", 
      color: COLORS.occupied,
    },
    maintenance: {
      label: "Mantenimiento",
      color: COLORS.maintenance,
    },
    cleaning: {
      label: "Limpieza",
      color: COLORS.cleaning,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Estado de Habitaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} 
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [`${value} habitaciones`, name]}
                  />
                }
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload?.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
