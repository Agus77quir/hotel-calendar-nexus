
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
import { useQueryClient } from '@tanstack/react-query';

const CheckInCheckOutPage = () => {
  const { reservations, guests, rooms, updateReservation, isLoading } = useHotelData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingReservations, setProcessingReservations] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split('T')[0];

  // Filtrar reservas por categorías
  const todayCheckIns = reservations.filter(r => 
    r.check_in === today && r.status === 'confirmed'
  );
  
  const todayCheckOuts = reservations.filter(r => 
    r.check_out === today && r.status === 'checked-in'
  );
  
  const currentGuests = reservations.filter(r => 
    r.status === 'checked-in' && 
    r.check_in <= today && 
    r.check_out >= today
  );

  const handleCheckIn = async (reservationId: string) => {
    if (processingReservations.has(reservationId)) return;
    
    const newProcessing = new Set(processingReservations);
    newProcessing.add(reservationId);
    setProcessingReservations(newProcessing);

    try {
      const reservation = reservations.find(r => r.id === reservationId);
      const guest = reservation ? guests.find(g => g.id === reservation.guest_id) : null;
      const room = reservation ? rooms.find(r => r.id === reservation.room_id) : null;
      
      await updateReservation({ 
        id: reservationId, 
        status: 'checked-in' as Reservation['status']
      });
      
      // Forzar actualización inmediata
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
      ]);
      
      toast({
        title: "✅ Check-in realizado",
        description: guest && room 
          ? `${guest.first_name} ${guest.last_name} en habitación ${room.number}`
          : "Check-in completado exitosamente",
      });
    } catch (error) {
      toast({
        title: "❌ Error en check-in",
        description: "No se pudo realizar el check-in",
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
      const reservation = reservations.find(r => r.id === reservationId);
      const guest = reservation ? guests.find(g => g.id === reservation.guest_id) : null;
      const room = reservation ? rooms.find(r => r.id === reservation.room_id) : null;
      
      await updateReservation({ 
        id: reservationId, 
        status: 'checked-out' as Reservation['status']
      });
      
      // Forzar actualización inmediata
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.refetchQueries({ queryKey: ['reservations'] }),
        queryClient.refetchQueries({ queryKey: ['rooms'] }),
      ]);
      
      toast({
        title: "✅ Check-out realizado",
        description: guest && room 
          ? `${guest.first_name} ${guest.last_name} - Habitación ${room.number} liberada`
          : "Check-out completado exitosamente",
      });
    } catch (error) {
      toast({
        title: "❌ Error en check-out",
        description: "No se pudo realizar el check-out",
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

    const getTypeConfig = () => {
      switch (type) {
        case 'checkin':
          return { icon: Calendar, color: 'text-green-600', label: 'Llegada Hoy', bgColor: 'bg-green-600' };
        case 'checkout':
          return { icon: Clock, color: 'text-blue-600', label: 'Salida Hoy', bgColor: 'bg-blue-600' };
        case 'current':
          return { icon: CheckCircle, color: 'text-green-600', label: 'En Hotel', bgColor: 'bg-green-600' };
      }
    };

    const config = getTypeConfig();
    const Icon = config.icon;

    return (
      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <Badge variant="outline" className="text-xs">#{reservation.id.slice(0, 8)}</Badge>
          </div>

          {/* Guest Info */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium">{guest.first_name} {guest.last_name}</div>
              <div className="text-sm text-muted-foreground">{guest.email}</div>
            </div>
          </div>

          {/* Room Info */}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">Habitación #{room.number}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {room.type.replace('-', ' ')} • {reservation.guests_count} huésped{reservation.guests_count > 1 ? 'es' : ''}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Entrada: </span>
              <span className="font-medium">
                {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Salida: </span>
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
                className={`w-full ${config.bgColor} hover:opacity-90 text-white`}
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check-in
                  </>
                )}
              </Button>
            )}
            
            {type === 'checkout' && (
              <Button
                onClick={() => handleCheckOut(reservation.id)}
                disabled={isProcessing}
                className={`w-full ${config.bgColor} hover:opacity-90 text-white`}
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Check-out
                  </>
                )}
              </Button>
            )}
            
            {type === 'current' && (
              <div className="flex gap-2">
                <Badge variant="outline" className="flex-1 justify-center text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  En Hotel
                </Badge>
                <Button
                  onClick={() => handleCheckOut(reservation.id)}
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  {isProcessing ? 'Procesando...' : 'Check-out'}
                </Button>
              </div>
            )}
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
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
          <BackToHomeButton />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando datos...</div>
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
            Gestiona las llegadas y salidas de huéspedes
          </p>
        </div>
        <BackToHomeButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Check-ins Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckIns.length}</div>
            <div className="text-xs text-muted-foreground">Confirmadas para hoy</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Check-outs Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckOuts.length}</div>
            <div className="text-xs text-muted-foreground">Registrados que salen hoy</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">En Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGuests.length}</div>
            <div className="text-xs text-muted-foreground">Huéspedes actuales</div>
          </CardContent>
        </Card>
      </div>

      {/* Check-ins for Today */}
      {todayCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Check-ins de Hoy ({todayCheckIns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCheckIns.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="checkin"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-outs for Today */}
      {todayCheckOuts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Check-outs de Hoy ({todayCheckOuts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayCheckOuts.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="checkout"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Guests */}
      {currentGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Huéspedes Actuales ({currentGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentGuests.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  type="current"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {todayCheckIns.length === 0 && todayCheckOuts.length === 0 && currentGuests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Sin actividad pendiente</h3>
            <p className="text-muted-foreground">No hay check-ins ni check-outs programados para hoy</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckInCheckOutPage;
