
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ReceptionistStatsCards } from '@/components/Dashboard/ReceptionistStatsCards';
import { DailyReservationsCard } from '@/components/Dashboard/DailyReservationsCard';
import { CalendarView } from '@/components/Calendar/CalendarView';
import { ReportExportButtons } from '@/components/Reports/ReportExportButtons';
import { ReservationModal } from '@/components/Reservations/ReservationModal';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsIPhone } from '@/hooks/use-mobile';

const Index = () => {
  const { user } = useAuth();
  const { stats, rooms, guests, reservations, addReservation, isLoading } = useHotelData();
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isIPhone = useIsIPhone();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservationModal, setReservationModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit'
  });

  const isReceptionist = user?.role === 'receptionist';

  // iPhone-specific optimizations
  useEffect(() => {
    if (isIPhone) {
      document.body.classList.add('iphone-optimized');
      
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
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
      console.log('💾 GUARDANDO RESERVA DESDE INDEX:', reservationData);
      
      await addReservation(reservationData);
      
      toast({
        title: "Reserva creada exitosamente",
        description: "La reserva ha sido guardada correctamente",
      });
      
      setReservationModal({ isOpen: false, mode: 'create' });
    } catch (error: any) {
      console.error('❌ ERROR GUARDANDO RESERVA EN INDEX:', error);
      
      const errorMessage = error.message || 'Error desconocido';
      if (errorMessage.includes('no_overlapping_reservations')) {
        toast({
          title: "Habitación no disponible",
          description: "La habitación ya está reservada para estas fechas.",
        });
      } else {
        toast({
          title: "No se pudo guardar",
          description: "Verifique los datos e intente nuevamente.",
        });
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 md:h-64">
        <div className="text-base md:text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-8 p-2 md:p-4 ${isIPhone ? 'pb-safe' : ''}`}>
      {/* Hero Section */}
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
        
        {/* Corner decorative elements */}
        <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-l-2 border-t-2 border-white/30 rounded-tl-lg`}></div>
        <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-r-2 border-t-2 border-white/30 rounded-tr-lg`}></div>
        <div className={`absolute bottom-2 left-2 sm:bottom-4 sm:left-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-l-2 border-b-2 border-white/30 rounded-bl-lg`}></div>
        <div className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 ${isIPhone ? 'w-6 h-6' : 'w-8 h-8 sm:w-12 sm:h-12'} border-r-2 border-b-2 border-white/30 rounded-br-lg`}></div>
      </div>

      {/* Quick Access to Reservations */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
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
                isIPhone ? 'text-base py-3 px-6 min-h-12' : 'px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg'
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
                isIPhone ? 'text-base py-3 px-6 min-h-12' : 'px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg'
              } touch-manipulation`}
            >
              Ver Todas las Reservas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reservations Section */}
      <div className="mb-4 sm:mb-6">
        <DailyReservationsCard 
          reservations={reservations}
          rooms={rooms}
          guests={guests}
          selectedDate={selectedDate}
        />
      </div>

      {/* Calendar Section */}
      <div className="mb-4 sm:mb-6">
        <CalendarView 
          reservations={reservations}
          onAddReservation={handleNewReservation}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
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

      {/* Stats Cards */}
      {isReceptionist ? (
        <ReceptionistStatsCards stats={stats} rooms={rooms} reservations={reservations} guests={guests} />
      ) : (
        <StatsCards stats={stats} rooms={rooms} reservations={reservations} />
      )}

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className={`flex items-center gap-2 ${isIPhone ? 'text-lg' : 'text-base sm:text-lg md:text-xl'}`}>
            <TrendingUp className={`${isIPhone ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
            Acciones Rápidas
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

      {/* Reservation Modal */}
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
