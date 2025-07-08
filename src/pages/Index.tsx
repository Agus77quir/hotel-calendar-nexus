
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user } = useAuth();
  const { stats, rooms, guests, reservations, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const isReceptionist = user?.role === 'receptionist';

  const handleQuickAction = (path: string) => {
    setOpenMobile(false); // Hide mobile menu
    navigate(path);
  };

  // Calculate the last system update based on most recent reservation activity
  const getLastUpdate = () => {
    if (reservations.length === 0) return 'Sin actividad reciente';
    
    const latestReservation = reservations.reduce((latest, current) => {
      const currentDate = new Date(current.updated_at || current.created_at);
      const latestDate = new Date(latest.updated_at || latest.created_at);
      return currentDate > latestDate ? current : latest;
    });
    
    const lastUpdateDate = new Date(latestReservation.updated_at || latestReservation.created_at);
    const timeAgo = formatDistanceToNow(lastUpdateDate, { 
      addSuffix: false, 
      locale: es 
    });
    
    // Remove "alrededor de" prefix if present
    return timeAgo.replace(/^alrededor de\s+/, '');
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
      {/* Enhanced Hero Section with Full Image Display */}
      <div className="relative h-48 md:h-80 rounded-xl overflow-hidden shadow-2xl group">
        <img 
          src="/lovable-uploads/df278197-6f7a-404b-ba89-ccbfc43e0d34.png"
          alt="Vista del hotel"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-blue-900/20 to-black/40" />
        
        {/* Decorative overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        
        {/* Enhanced text content */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 drop-shadow-2xl filter brightness-110">
              Bienvenido a Nardini SRL
            </h1>
            <p className="text-lg md:text-2xl font-semibold drop-shadow-lg filter brightness-105">
              Sistema de Gestión Hotelera
            </p>
          </div>
        </div>
        
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-white/30 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-white/30 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
      </div>

      {/* Quick Access to Reservations - Prominent Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Calendar className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
            Gestión de Reservas
          </CardTitle>
          <p className="text-muted-foreground text-sm md:text-base">
            Accede rápidamente a crear nuevas reservas y gestionar huéspedes
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={() => handleQuickAction('/reservations')}
            size="lg"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Reserva
          </Button>
        </CardContent>
      </Card>

      {/* Export Buttons Section - Only for admins */}
      {!isReceptionist && (
        <div className="flex justify-end">
          <ReportExportButtons 
            reservations={reservations}
            guests={guests}
            rooms={rooms}
          />
        </div>
      )}

      {/* Stats Cards - Different for receptionists */}
      {isReceptionist ? (
        <ReceptionistStatsCards stats={stats} rooms={rooms} />
      ) : (
        <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      )}

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
        {/* Quick Actions Card with Icons - Restrict for receptionists */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Acciones Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div 
                className="relative group cursor-pointer rounded-lg p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 active:scale-95"
                onClick={() => handleQuickAction('/reservations')}
              >
                <div className="text-center">
                  <Calendar className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-purple-600" />
                  <p className="font-semibold text-purple-800 text-sm md:text-base">Ver Todas las Reservas</p>
                  <p className="text-xs text-purple-600 mt-1">Lista completa y filtros</p>
                </div>
              </div>
              
              {/* Only show Rooms for admins */}
              {!isReceptionist && (
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
              )}
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
                <span className="text-xs md:text-sm font-medium">hace {getLastUpdate()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
