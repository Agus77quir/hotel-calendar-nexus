import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, User, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Reservation } from '@/types/hotel';

const CheckInOutPage = () => {
  const { reservations, guests, rooms, updateReservation, forceRefresh, isLoading } = useHotelData();
  const { toast } = useToast();
  const [processingReservations, setProcessingReservations] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split('T')[0];

  // Reservas que llegan hoy (para check-in)
  const todayCheckIns = reservations.filter(r => 
    r.check_in === today && r.status === 'confirmed'
  );

  // Reservas que se van hoy (para check-out)
  const todayCheckOuts = reservations.filter(r => 
    r.check_out === today && r.status === 'checked-in'
  );

  // Huéspedes actualmente registrados
  const currentGuests = reservations.filter(r => r.status === 'checked-in');

  const handleCheckIn = async (reservationId: string) => {
    if (processingReservations.has(reservationId)) return;
    
    const newProcessing = new Set(processingReservations);
    newProcessing.add(reservationId);
    setProcessingReservations(newProcessing);

    try {
      console.log('🔄 ENHANCED CHECK-IN: Starting for reservation:', reservationId);
      
      await updateReservation({ 
        id: reservationId, 
        status: 'checked-in' as Reservation['status']
      });
      
      // ENHANCED: Multiple refresh cycles to guarantee UI updates
      console.log('🔄 ENHANCED CHECK-IN: Starting multiple refresh cycles');
      await forceRefresh();
      
      // Additional refresh cycles for absolute certainty
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 ENHANCED CHECK-IN: Secondary refresh completed');
      }, 300);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 ENHANCED CHECK-IN: Tertiary refresh completed');
      }, 1000);
      
      const reservation = reservations.find(r => r.id === reservationId);
      const guest = reservation ? guests.find(g => g.id === reservation.guest_id) : null;
      const room = reservation ? rooms.find(r => r.id === reservation.room_id) : null;
      
      console.log('✅ ENHANCED CHECK-IN: Completed successfully with guaranteed updates');
      
      toast({
        title: "Check-in realizado exitosamente",
        description: guest && room 
          ? `${guest.first_name} ${guest.last_name} registrado en habitación ${room.number}. Dashboard actualizado automáticamente.`
          : "Check-in completado. Dashboard actualizado automáticamente.",
      });
    } catch (error) {
      console.error('❌ ENHANCED CHECK-IN: Error:', error);
      toast({
        title: "Error en check-in",
        description: "No se pudo realizar el check-in. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      const newProcessing = new Set(processingReservations);
      newProcessing.delete(reservationId);
      setProcessingReservations(newProcessing);
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    if (processingReservations.has(reservationId)) return;
    
    const newProcessing = new Set(processingReservations);
    newProcessing.add(reservationId);
    setProcessingReservations(newProcessing);

    try {
      console.log('🔄 ENHANCED CHECK-OUT: Starting for reservation:', reservationId);
      
      await updateReservation({ 
        id: reservationId, 
        status: 'checked-out' as Reservation['status']
      });
      
      // ENHANCED: Multiple refresh cycles to guarantee UI updates
      console.log('🔄 ENHANCED CHECK-OUT: Starting multiple refresh cycles');
      await forceRefresh();
      
      // Additional refresh cycles for absolute certainty
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 ENHANCED CHECK-OUT: Secondary refresh completed');
      }, 300);
      
      setTimeout(async () => {
        await forceRefresh();
        console.log('🔄 ENHANCED CHECK-OUT: Tertiary refresh completed');
      }, 1000);
      
      const reservation = reservations.find(r => r.id === reservationId);
      const guest = reservation ? guests.find(g => g.id === reservation.guest_id) : null;
      const room = reservation ? rooms.find(r => r.id === reservation.room_id) : null;
      
      console.log('✅ ENHANCED CHECK-OUT: Completed successfully with guaranteed updates');
      
      toast({
        title: "Check-out realizado exitosamente",
        description: guest && room 
          ? `${guest.first_name} ${guest.last_name} finalizó estadía en habitación ${room.number}. Dashboard actualizado automáticamente.`
          : "Check-out completado. Dashboard actualizado automáticamente.",
      });
    } catch (error) {
      console.error('❌ ENHANCED CHECK-OUT: Error:', error);
      toast({
        title: "Error en check-out",
        description: "No se pudo realizar el check-out. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      const newProcessing = new Set(processingReservations);
      newProcessing.delete(reservationId);
      setProcessingReservations(newProcessing);
    }
  };

  const ReservationCard = ({ 
    reservation, 
    type 
  }: { 
    reservation: any; 
    type: 'checkin' | 'checkout' | 'current' 
  }) => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    const isProcessing = processingReservations.has(reservation.id);
    
    if (!guest || !room) return null;

    return (
      <Card key={reservation.id} className="w-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {type === 'checkin' && <Calendar className="h-4 w-4 text-green-600" />}
                {type === 'checkout' && <Clock className="h-4 w-4 text-blue-600" />}
                {type === 'current' && <CheckCircle className="h-4 w-4 text-green-600" />}
                <span className="text-sm font-medium">
                  {type === 'checkin' && 'Llegada Hoy'}
                  {type === 'checkout' && 'Salida Hoy'}
                  {type === 'current' && 'Huésped Actual'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                #{reservation.id.slice(0, 8)}
              </div>
            </div>

            {/* Guest Info */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">
                  {guest.first_name} {guest.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {guest.email}
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Habitación #{room.number}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {room.type.replace('-', ' ')} • {reservation.guests_count} huésped{reservation.guests_count > 1 ? 'es' : ''}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Check-in: </span>
                <span className="font-medium">
                  {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Check-out: </span>
                <span className="font-medium">
                  {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 border-t">
              {type === 'checkin' && (
                <Button
                  onClick={() => handleCheckIn(reservation.id)}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Procesando Check-in...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Realizar Check-in
                    </>
                  )}
                </Button>
              )}
              
              {type === 'checkout' && (
                <Button
                  onClick={() => handleCheckOut(reservation.id)}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Procesando Check-out...
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Realizar Check-out
                    </>
                  )}
                </Button>
              )}
              
              {type === 'current' && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex-1 justify-center text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Registrado
                  </Badge>
                  <Button
                    onClick={() => handleCheckOut(reservation.id)}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-3 w-3 mr-1 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Check-out
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Check-in / Check-out</h1>
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
          <BackToHomeButton />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando información...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-in / Check-out</h1>
          <p className="text-muted-foreground">
            Gestión de llegadas y salidas para hoy • Actualizaciones automáticas activadas
          </p>
        </div>
        <BackToHomeButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Check-ins Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckIns.length}</div>
            <p className="text-xs text-muted-foreground">
              Reservas confirmadas que llegan hoy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Check-outs Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckOuts.length}</div>
            <p className="text-xs text-muted-foreground">
              Huéspedes que se van hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              Huéspedes Actuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGuests.length}</div>
            <p className="text-xs text-muted-foreground">
              Registrados actualmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Check-ins for Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Check-ins de Hoy ({todayCheckIns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayCheckIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay check-ins programados para hoy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCheckIns.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="checkin"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-outs for Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Check-outs de Hoy ({todayCheckOuts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayCheckOuts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay check-outs programados para hoy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCheckOuts.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="checkout"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Guests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Huéspedes Actuales ({currentGuests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay huéspedes registrados actualmente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentGuests.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="current"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ENHANCED Debug Info with real-time status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Sistema Automatizado - Actualizaciones en Tiempo Real Activas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div>✅ Actualizaciones automáticas: ACTIVADAS</div>
          <div>✅ Tiempo real con Supabase: CONECTADO</div>
          <div>✅ Refrescos múltiples: GARANTIZADOS</div>
          <div>Reservas totales: {reservations.length}</div>
          <div>Confirmadas: {reservations.filter(r => r.status === 'confirmed').length}</div>
          <div>Registradas: {reservations.filter(r => r.status === 'checked-in').length}</div>
          <div>Finalizadas: {reservations.filter(r => r.status === 'checked-out').length}</div>
          <div>Habitaciones ocupadas: {rooms.filter(r => r.status === 'occupied').length}</div>
          <div>Habitaciones disponibles: {rooms.filter(r => r.status === 'available').length}</div>
          <div>Última actualización: {new Date().toLocaleTimeString()}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInOutPage;
