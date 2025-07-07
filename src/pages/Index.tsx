import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { HotelCalendar } from '@/components/Calendar/HotelCalendar';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Index = () => {
  const { user } = useAuth();
  const { stats, rooms, guests, reservations, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const isReceptionist = user?.role === 'receptionist';

  const handleQuickAction = (path: string) => {
    setOpenMobile(false);
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
      {/* Enhanced Hero Section */}
      <div className="relative h-48 md:h-80 rounded-xl overflow-hidden shadow-2xl">
        <img 
          src="/lovable-uploads/df278197-6f7a-404b-ba89-ccbfc43e0d34.png"
          alt="Hotel Nardini"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-100"
          style={{ 
            filter: 'brightness(0.85) contrast(1.1) saturate(1.1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 flex items-center justify-center p-6">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-2xl md:text-5xl font-bold drop-shadow-2xl leading-tight tracking-wide">
              Bienvenido a Nardini SRL
            </h1>
            <p className="text-lg md:text-xl font-medium drop-shadow-lg mt-2 opacity-95">
              Sistema de Gestión Hotelera
            </p>
          </div>
        </div>
        {/* Decorative border */}
        <div className="absolute inset-0 ring-1 ring-white/20 ring-inset rounded-xl"></div>
      </div>

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
              
              <div 
                className={`relative group cursor-pointer rounded-lg p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 active:scale-95 ${isReceptionist ? 'col-span-1 sm:col-span-2' : 'col-span-1 sm:col-span-2'}`}
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
