
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { useHotelData } from '@/hooks/useHotelData';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { stats, rooms, guests, reservations, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const handleQuickAction = (path: string) => {
    setOpenMobile(false); // Hide mobile menu
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 md:h-64">
        <div className="text-base md:text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Hero Section with Landscape Image */}
      <div className="relative h-40 md:h-64 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=400"
          alt="Paisaje montañoso"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h1 className="text-xl md:text-4xl font-bold">Bienvenido a Nardini SRL Gestión Hotelera</h1>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} rooms={rooms} reservations={reservations} />

      {/* Calendar Section */}
      <div className="mb-6">
        <HotelCalendar 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
          onAddReservation={() => handleQuickAction('/reservations')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Quick Actions Card with Icons */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div 
                className="relative group cursor-pointer rounded-lg p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 active:scale-95"
                onClick={() => handleQuickAction('/guests')}
              >
                <div className="text-center">
                  <Users className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-blue-600" />
                  <p className="font-semibold text-blue-800 text-sm md:text-base">Huéspedes</p>
                  <p className="text-xs text-blue-600 mt-1">Gestionar registros</p>
                </div>
              </div>
              
              <div 
                className="relative group cursor-pointer rounded-lg p-4 md:p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 active:scale-95"
                onClick={() => handleQuickAction('/rooms')}
              >
                <div className="text-center">
                  <Building2 className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-green-600" />
                  <p className="font-semibold text-green-800 text-sm md:text-base">Habitaciones</p>
                  <p className="text-xs text-green-600 mt-1">Estado y disponibilidad</p>
                </div>
              </div>
              
              <div 
                className="relative group cursor-pointer rounded-lg p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 col-span-1 sm:col-span-2 active:scale-95"
                onClick={() => handleQuickAction('/reservations')}
              >
                <div className="text-center">
                  <Calendar className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-purple-600" />
                  <p className="font-semibold text-purple-800 text-sm md:text-base">Nueva Reserva</p>
                  <p className="text-xs text-purple-600 mt-1">Crear nueva reservación</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Sistema Operativo</span>
                <span className="text-xs md:text-sm font-medium text-green-600">Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Última Actualización</span>
                <span className="text-xs md:text-sm font-medium">Hace 3 días</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
