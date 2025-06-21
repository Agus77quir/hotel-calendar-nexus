
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { DailyReservations } from '@/components/Dashboard/DailyReservations';
import { useHotelData } from '@/hooks/useHotelData';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';

const Index = () => {
  const { stats, isLoading } = useHotelData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Hotel Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=1200&h=400"
          alt="Hotel lobby"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Bienvenido al Sistema de Gestión Hotelera</h1>
            <p className="text-xl">Administra tu hotel de manera eficiente y profesional</p>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyReservations />
        
        {/* Quick Actions Card with Hotel Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=200"
                  alt="Gestión de huéspedes"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">Huéspedes</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200"
                  alt="Gestión de habitaciones"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">Habitaciones</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group cursor-pointer rounded-lg overflow-hidden col-span-2">
                <img 
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&h=200"
                  alt="Reservas"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold">Nueva Reserva</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
