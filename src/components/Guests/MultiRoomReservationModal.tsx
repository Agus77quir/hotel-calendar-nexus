
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, DollarSign } from 'lucide-react';
import { Room, Guest } from '@/types/hotel';
import { formatDisplayDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

interface MultiRoomReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  rooms: Room[];
  onCreateReservations: (reservationsData: any[]) => Promise<void>;
}

export const MultiRoomReservationModal = ({
  isOpen,
  onClose,
  guest,
  rooms,
  onCreateReservations
}: MultiRoomReservationModalProps) => {
  const { toast } = useToast();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState<{[key: string]: number}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const availableRooms = rooms.filter(room => room.status === 'available');

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        const newSelected = prev.filter(id => id !== roomId);
        // Remove guests count for unselected room
        const newGuestsCount = { ...guestsCount };
        delete newGuestsCount[roomId];
        setGuestsCount(newGuestsCount);
        return newSelected;
      } else {
        // Set default guests count for newly selected room
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          setGuestsCount(prev => ({ ...prev, [roomId]: 1 }));
        }
        return [...prev, roomId];
      }
    });
  };

  const handleGuestsCountChange = (roomId: string, count: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room && count >= 1 && count <= room.capacity) {
      setGuestsCount(prev => ({ ...prev, [roomId]: count }));
    }
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return selectedRooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        const roomTotal = Number(room.price) * nights;
        const discount = guest.is_associated ? (roomTotal * guest.discount_percentage / 100) : 0;
        return total + (roomTotal - discount);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async () => {
    if (selectedRooms.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una habitación",
        variant: "destructive",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Error", 
        description: "Debe seleccionar fechas de check-in y check-out",
        variant: "destructive",
      });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "Error",
        description: "La fecha de check-out debe ser posterior al check-in",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const reservationsData = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const roomTotal = Number(room?.price || 0) * nights;
        const discount = guest.is_associated ? (roomTotal * guest.discount_percentage / 100) : 0;
        
        return {
          guest_id: guest.id,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount[roomId] || 1,
          status: 'confirmed',
          total_amount: roomTotal - discount,
          created_by: 'admin',
        };
      });

      await onCreateReservations(reservationsData);
      
      toast({
        title: "Reservas creadas",
        description: `Se crearon ${selectedRooms.length} reservas exitosamente`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron crear las reservas. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRooms([]);
    setCheckIn('');
    setCheckOut('');
    setGuestsCount({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reserva Múltiple para {guest.first_name} {guest.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkout">Check-out</Label>
              <Input
                id="checkout"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          {/* Habitaciones disponibles */}
          <div>
            <h3 className="text-lg font-medium mb-4">Seleccionar Habitaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {availableRooms.map((room) => (
                <Card key={room.id} className={`cursor-pointer transition-colors ${
                  selectedRooms.includes(room.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={() => handleRoomToggle(room.id)}
                        />
                        <div>
                          <div className="font-medium">Habitación {room.number}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {room.type.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        ${Number(room.price).toLocaleString()}
                      </Badge>
                    </div>

                    {selectedRooms.includes(room.id) && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <Label className="text-sm">Huéspedes:</Label>
                        <Input
                          type="number"
                          min={1}
                          max={room.capacity}
                          value={guestsCount[room.id] || 1}
                          onChange={(e) => handleGuestsCountChange(room.id, parseInt(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">/ {room.capacity}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resumen */}
          {selectedRooms.length > 0 && checkIn && checkOut && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">
                      {selectedRooms.length} habitación(es) seleccionada(s)
                    </div>
                    <div className="text-sm text-blue-700">
                      {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
                    </div>
                    {guest.is_associated && guest.discount_percentage > 0 && (
                      <div className="text-sm text-green-600">
                        Descuento aplicado: {guest.discount_percentage}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xl font-bold">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedRooms.length === 0 || !checkIn || !checkOut || isSubmitting}
          >
            {isSubmitting ? 'Creando...' : `Crear ${selectedRooms.length} Reserva(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
