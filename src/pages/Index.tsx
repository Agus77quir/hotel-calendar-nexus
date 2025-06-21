
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { useHotelData } from '@/hooks/useHotelData';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { stats, rooms, guests, reservations, isLoading } = useHotelData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Huéspedes',
      icon: Users,
      path: '/guests',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Habitaciones',
      icon: Building2,
      path: '/rooms',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Nueva Reserva',
      icon: Calendar,
      path: '/reservations',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Hotel Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&h=400"
          alt="Hotel elegante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Bienvenidos al Sistema de Gestión Hotelera</h1>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyReservations 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
          selectedDate={selectedDate}
        />
        
        {/* Quick Actions Card with Icons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <div 
                  key={action.title}
                  className={`${action.color} ${index === 2 ? 'col-span-2' : ''} relative group cursor-pointer rounded-lg p-6 text-white transition-all duration-200 hover:scale-105 shadow-lg`}
                  onClick={() => navigate(action.path)}
                >
                  <div className="text-center">
                    <action.icon className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">{action.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
