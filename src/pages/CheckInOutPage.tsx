
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, Clock, Calendar } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const CheckInOutPage = () => {
  const { reservations, guests, rooms, updateReservation, isLoading } = useHotelData();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  // Filtrar reservas para hoy
  const todayCheckIns = reservations.filter(reservation => 
    reservation.check_in === today && reservation.status === 'confirmed'
  );

  const todayCheckOuts = reservations.filter(reservation => 
    reservation.check_out === today && reservation.status === 'checked-in'
  );

  const currentGuests = reservations.filter(reservation => 
    reservation.status === 'checked-in'
  );

  const filteredReservations = [...todayCheckIns, ...todayCheckOuts, ...currentGuests].filter(reservation => {
    const guest = guests.find(g => g.id === reservation.guest_id);
    const room = rooms.find(r => r.id === reservation.room_id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      guest?.first_name.toLowerCase().includes(searchLower) ||
      guest?.last_name.toLowerCase().includes(searchLower) ||
      room?.number.includes(searchLower) ||
      reservation.id.includes(searchLower)
    );
  });

  const handleCheckIn = async (reservationId: string) => {
    try {
      await updateReservation(reservationId, { status: 'checked-in' });
      toast({
        title: "Check-in exitoso",
        description: "El huésped ha sido registrado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-in",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    try {
      await updateReservation(reservationId, { status: 'checked-out' });
      toast({
        title: "Check-out exitoso",
        description: "El huésped ha finalizado su estadía",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-out",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Pendiente Check-in';
      case 'checked-in':
        return 'Registrado';
      case 'checked-out':
        return 'Check-out realizado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-in / Check-out</h1>
          <p className="text-muted-foreground">
            Gestiona las llegadas y salidas del hotel
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Hoy</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayCheckIns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Hoy</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayCheckOuts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes Actuales</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentGuests.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar reservas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredReservations.length} reservas encontradas
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="py-3 px-4 text-left font-medium">Huésped</th>
                  <th className="py-3 px-4 text-left font-medium">Habitación</th>
                  <th className="py-3 px-4 text-left font-medium">Check-in</th>
                  <th className="py-3 px-4 text-left font-medium">Check-out</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No se encontraron reservas para hoy
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const guest = guests.find(g => g.id === reservation.guest_id);
                    const room = rooms.find(r => r.id === reservation.room_id);

                    return (
                      <tr key={reservation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {guest ? `${guest.first_name} ${guest.last_name}` : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {guest?.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{room?.number || 'N/A'}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.check_in), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.check_out), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {reservation.status === 'confirmed' && reservation.check_in === today && (
                              <Button 
                                size="sm"
                                onClick={() => handleCheckIn(reservation.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Check-in
                              </Button>
                            )}
                            {reservation.status === 'checked-in' && reservation.check_out === today && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckOut(reservation.id)}
                                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Check-out
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInOutPage;
