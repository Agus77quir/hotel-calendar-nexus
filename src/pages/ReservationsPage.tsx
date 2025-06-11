
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservationsPage = () => {
  const { reservations, guests, rooms } = useHotelData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReservations = reservations.filter(reservation => {
    const guest = guests.find(g => g.id === reservation.guestId);
    const room = rooms.find(r => r.id === reservation.roomId);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      guest?.firstName.toLowerCase().includes(searchLower) ||
      guest?.lastName.toLowerCase().includes(searchLower) ||
      guest?.email.toLowerCase().includes(searchLower) ||
      room?.number.includes(searchLower) ||
      reservation.id.includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'checked-in':
        return 'Registrado';
      case 'checked-out':
        return 'Check-out';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservas del hotel
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
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
                  <th className="py-3 px-4 text-left font-medium">ID</th>
                  <th className="py-3 px-4 text-left font-medium">Huésped</th>
                  <th className="py-3 px-4 text-left font-medium">Habitación</th>
                  <th className="py-3 px-4 text-left font-medium">Check-in</th>
                  <th className="py-3 px-4 text-left font-medium">Check-out</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                  <th className="py-3 px-4 text-left font-medium">Total</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const guest = guests.find(g => g.id === reservation.guestId);
                    const room = rooms.find(r => r.id === reservation.roomId);

                    return (
                      <tr key={reservation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{reservation.id}</td>
                        <td className="py-3 px-4">
                          {guest ? `${guest.firstName} ${guest.lastName}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">{room?.number || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.checkIn), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(reservation.checkOut), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(reservation.status)}>
                            {getStatusText(reservation.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">${reservation.totalAmount}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

export default ReservationsPage;
