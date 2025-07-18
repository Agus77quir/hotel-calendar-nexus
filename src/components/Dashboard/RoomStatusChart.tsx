
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Room } from '@/types/hotel';
import { Home } from 'lucide-react';

interface RoomStatusChartProps {
  rooms: Room[];
}

export const RoomStatusChart = ({ rooms }: RoomStatusChartProps) => {
  console.log('RoomStatusChart - All rooms:', rooms);
  
  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Room status counts:', statusCounts);

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

  console.log('Chart data:', data);

  const COLORS = {
    available: '#10b981',
    occupied: '#ef4444',
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
        {/* Resumen numérico visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-700">{statusCounts.available || 0}</div>
            <div className="text-xs text-green-600">Disponibles</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-700">{statusCounts.occupied || 0}</div>
            <div className="text-xs text-red-600">Ocupadas</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-700">{statusCounts.maintenance || 0}</div>
            <div className="text-xs text-yellow-600">Mantenimiento</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-700">{statusCounts.cleaning || 0}</div>
            <div className="text-xs text-purple-600">Limpieza</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[200px]">
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
