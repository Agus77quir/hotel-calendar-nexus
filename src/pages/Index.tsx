
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { DailyReservationsCard } from '@/components/Dashboard/DailyReservationsCard';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Calendar, TrendingUp, Plus, Smartphone } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsIPhone, useIsIOS } from '@/hooks/use-mobile';

const Index = () => {
  const { user } = useAuth();
  const { stats, rooms, guests, reservations, addReservation, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isIPhone = useIsIPhone();
  const isIOS = useIsIOS();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservationModal, setReservationModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit'
  });

  const isReceptionist = user?.role === 'receptionist';

  // iPhone-specific optimizations
  useEffect(() => {
    if (isIPhone) {
      // Add iPhone-specific class to body
      document.body.classList.add('iphone-optimized');
      
      // Optimize viewport for iPhone
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
      // Prevent bounce scrolling on iPhone
      document.body.style.overscrollBehavior = 'none';
      
      return () => {
        document.body.classList.remove('iphone-optimized');
      };
    }
  }, [isIPhone]);

  const handleQuickAction = (path: string) => {
    setOpenMobile(false);
    navigate(path);
  };

  const handleNewReservation = () => {
    setReservationModal({ isOpen: true, mode: 'create' });
  };

  const handleSaveReservation = async (reservationData: any) => {
    try {
      await addReservation(reservationData);
      toast({
        title: "Reserva creada exitosamente",
        description: "La reserva ha sido guardada correctamente",
      });
      setReservationModal({ isOpen: false, mode: 'create' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
      <div className="flex items-center justify-center h-32 md:h-64 iphone-safe-area">
        <div className="text-base md:text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-8 p-2 md:p-4 ${isIPhone ? 'iphone-safe-area' : ''}`}>
      {/* iPhone optimization indicator */}
      {isIPhone && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">Optimizado para iPhone</span>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section - iPhone optimized */}
      <div className={`relative h-32 sm:h-48 md:h-80 rounded-xl overflow-hidden shadow-2xl group ${isIPhone ? 'touch-manipulation' : ''}`}>
        <img 
          src="/lovable-uploads/df278197-6f7a-404b-ba89-ccbfc43e0d34.png"
          alt="Vista del hotel"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          loading="eager"
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-blue-900/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center text-white max-w-4xl">
            <h1 className={`${isIPhone ? 'text-lg sm:text-xl md:text-3xl' : 'text-xl sm:text-2xl md:text-5xl'} font-bold mb-1 sm:mb-2 md:mb-4 drop-shadow-2xl filter brightness-110`}>
              Bienvenido a Nardini SRL
            </h1>
            <p className={`${isIPhone ? 'text-sm md:text-lg' : 'text-sm sm:text-lg md:text-2xl'} font-semibold drop-shadow-lg filter brightness-105`}>
              Sistema de Gestión Hotelera
            </p>
          </div>
        </div>
        
        {/* iPhone-optimized corner elements */}
        <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-l-2 border-t-2 border-white/30 rounded-tl-lg`}></div>
        <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-r-2 border-t-2 border-white/30 rounded-tr-lg`}></div>
        <div className={`absolute bottom-2 left-2 sm:bottom-4 sm:left-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-l-2 border-b-2 border-white/30 rounded-bl-lg`}></div>
        <div className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-r-2 border-b-2 border-white/30 rounded-br-lg`}></div>
      </div>

      {/* Enhanced Quick Access to Reservations - iPhone optimized */}
      <Card className={`bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg ${isIPhone ? 'iphone-card' : ''}`}>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className={`flex items-center gap-2 sm:gap-3 ${isIPhone ? 'text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl'}`}>
            <Calendar className={`${isIPhone ? 'h-5 w-5' : 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7'} text-purple-600`} />
            Gestión de Reservas
          </CardTitle>
          <p className={`text-muted-foreground ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm md:text-base'}`}>
            Crea nuevas reservas y gestiona huéspedes rápidamente
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={handleNewReservation}
              size="lg"
              className={`w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                isIPhone ? 'iphone-button text-base py-3 px-6' : 'px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg'
              } font-semibold touch-manipulation`}
            >
              <Plus className={`${isIPhone ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'} mr-2`} />
              Nueva Reserva
            </Button>
            <Button 
              onClick={() => handleQuickAction('/reservations')}
              variant="outline"
              size="lg"
              className={`w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-100 font-semibold ${
                isIPhone ? 'iphone-button text-base py-3 px-6' : 'px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg'
              } touch-manipulation`}
            >
              Ver Todas las Reservas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Daily Reservations Section - iPhone optimized */}
      <div className="mb-4 sm:mb-6">
        <DailyReservationsCard 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
          selectedDate={selectedDate}
        />
      </div>

      {/* Enhanced Calendar Section - iPhone optimized */}
      <div className="mb-4 sm:mb-6">
        <CalendarView 
          reservations={reservations}
          onAddReservation={handleNewReservation}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>

      {/* Export Buttons Section - Only for admins, iPhone optimized */}
      {!isReceptionist && (
        <div className="flex justify-end">
          <ReportExportButtons 
            reservations={reservations}
            guests={guests}
            rooms={rooms}
          />
        </div>
      )}

      {/* Enhanced Stats Cards - iPhone optimized */}
      {isReceptionist ? (
        <ReceptionistStatsCards stats={stats} rooms={rooms} reservations={reservations} guests={guests} />
      ) : (
        <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Enhanced Quick Actions Card - iPhone optimized */}
        <Card className={isIPhone ? 'iphone-card' : ''}>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className={`flex items-center gap-2 ${isIPhone ? 'text-lg' : 'text-base sm:text-lg md:text-xl'}`}>
              <TrendingUp className={`${isIPhone ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
              Acciones Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <div 
                className={`relative group cursor-pointer rounded-lg p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 ${
                  isIPhone ? 'touch-manipulation active:scale-95' : 'active:scale-95'
                }`}
                onClick={() => handleQuickAction('/reservations')}
              >
                <div className="text-center">
                  <Calendar className={`${isIPhone ? 'h-8 w-8' : 'h-6 w-6 sm:h-12 sm:w-12'} mx-auto mb-2 sm:mb-3 text-purple-600`} />
                  <p className={`font-semibold text-purple-800 ${isIPhone ? 'text-base' : 'text-sm sm:text-base'}`}>Ver Todas las Reservas</p>
                  <p className={`text-purple-600 mt-1 ${isIPhone ? 'text-sm' : 'text-xs'}`}>Lista completa y filtros</p>
                </div>
              </div>
              
              {!isReceptionist && (
                <div 
                  className={`relative group cursor-pointer rounded-lg p-3 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 ${
                    isIPhone ? 'touch-manipulation active:scale-95' : 'active:scale-95'
                  }`}
                  onClick={() => handleQuickAction('/rooms')}
                >
                  <div className="text-center">
                    <Building2 className={`${isIPhone ? 'h-8 w-8' : 'h-6 w-6 sm:h-12 sm:w-12'} mx-auto mb-2 sm:mb-3 text-green-600`} />
                    <p className={`font-semibold text-green-800 ${isIPhone ? 'text-base' : 'text-sm sm:text-base'}`}>Habitaciones</p>
                    <p className={`text-green-600 mt-1 ${isIPhone ? 'text-sm' : 'text-xs'}`}>Estado y disponibilidad</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced System Status Card - iPhone optimized */}
        <Card className={isIPhone ? 'iphone-card' : ''}>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className={`flex items-center gap-2 ${isIPhone ? 'text-lg' : 'text-base sm:text-lg md:text-xl'}`}>
              <Building2 className={`${isIPhone ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-muted-foreground ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>Total Reservas</span>
                <span className={`font-medium ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>{reservations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-muted-foreground ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>Sistema Operativo</span>
                <span className={`font-medium text-green-600 ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>Funcionando</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-muted-foreground ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>Última Actualización</span>
                <span className={`font-medium ${isIPhone ? 'text-sm' : 'text-xs sm:text-sm'}`}>{getLastUpdate()}</span>
              </div>
              {isIPhone && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground text-sm">Dispositivo</span>
                  <span className="font-medium text-blue-600 text-sm">iPhone Optimizado</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Reservation Modal - iPhone optimized */}
      <ReservationModal
        isOpen={reservationModal.isOpen}
        onClose={() => setReservationModal({ isOpen: false, mode: 'create' })}
        onSave={handleSaveReservation}
        rooms={rooms}
        guests={guests}
        mode={reservationModal.mode}
      />
    </div>
  );
};

export default Index;
