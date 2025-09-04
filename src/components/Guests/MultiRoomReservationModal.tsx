
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Users, DollarSign, Percent, UserCheck } from 'lucide-react';
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
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const availableRooms = rooms.filter(room => room.status === 'available');

  const discountOptions = [
    { value: '0', label: 'Sin descuento (0%)' },
    { value: '5', label: '5% de descuento' },
    { value: '10', label: '10% de descuento' },
    { value: '15', label: '15% de descuento' },
    { value: '20', label: '20% de descuento' },
    { value: '25', label: '25% de descuento' },
    { value: '30', label: '30% de descuento' },
  ];

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

  const handleGuestsCountChange = (roomId: string, value: string) => {
    const count = parseInt(value) || 1;
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      // Ensure count is within valid range (1 to capacity)
      const validCount = Math.max(1, Math.min(count, room.capacity));
      setGuestsCount(prev => ({ ...prev, [roomId]: validCount }));
    }
  };

  const handleDiscountChange = (value: string) => {
    const percentage = parseInt(value);
    setDiscountPercentage(percentage);
  };

  const handleAssociatedDiscountToggle = (checked: boolean) => {
    if (checked && guest?.is_associated) {
      const defaultDiscount = guest.discount_percentage || 10;
      setDiscountPercentage(defaultDiscount);
    } else {
      setDiscountPercentage(0);
    }
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return { subtotal: 0, discount: 0, total: 0 };
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const subtotal = selectedRooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        return total + (Number(room.price) * nights);
      }
      return total;
    }, 0);

    const discountAmount = discountPercentage > 0 ? (subtotal * discountPercentage) / 100 : 0;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discount: discountAmount,
      total
    };
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
      const totalCalculation = calculateTotal();
      
      const reservationsData = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const roomSubtotal = Number(room?.price || 0) * nights;
        const roomDiscountAmount = discountPercentage > 0 ? (roomSubtotal * discountPercentage) / 100 : 0;
        const roomTotal = roomSubtotal - roomDiscountAmount;
        
        return {
          guest_id: guest.id,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount[roomId] || 1,
          status: 'confirmed',
          total_amount: roomTotal,
          created_by: 'admin',
        };
      });

      await onCreateReservations(reservationsData);
      
      // Crear un mensaje único para todas las reservas
      const roomNumbers = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        return room?.number || roomId;
      }).join(', ');
      
      const totalGuests = Object.values(guestsCount).reduce((sum, count) => sum + count, 0);
      
      toast({
        title: "Reservas múltiples creadas",
        description: `Se crearon ${selectedRooms.length} reservas para ${guest.first_name} ${guest.last_name} en las habitaciones ${roomNumbers} (${totalGuests} huéspedes en total) desde ${formatDisplayDate(checkIn)} hasta ${formatDisplayDate(checkOut)}`,
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
    setDiscountPercentage(0);
    onClose();
  };

  const totalCalculation = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed inset-0 z-50 w-screen h-screen sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[95vw] sm:max-w-4xl sm:max-h-[90vh] sm:inset-auto overflow-y-auto bg-background border-0 sm:border shadow-lg rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reserva Múltiple para {guest.first_name} {guest.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 p-1 sm:p-2">
          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="touch-manipulation h-12 sm:h-auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out</Label>
              <Input
                id="checkout"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="touch-manipulation h-12 sm:h-auto"
              />
            </div>
          </div>

          {/* Habitaciones disponibles */}
          <div>
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Seleccionar Habitaciones</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-h-60 sm:max-h-80 overflow-y-auto">
              {availableRooms.map((room) => (
                <Card key={room.id} className={`cursor-pointer transition-colors ${
                  selectedRooms.includes(room.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
                }`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                        <Checkbox
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={() => handleRoomToggle(room.id)}
                        />
                        <div>
                          <div className="font-medium text-sm sm:text-base">Habitación {room.number}</div>
                          <div className="text-xs sm:text-sm text-gray-500 capitalize">
                            {room.type.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        ${Number(room.price).toLocaleString()}
                      </Badge>
                    </div>

                    {selectedRooms.includes(room.id) && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <Label className="text-xs sm:text-sm">Huéspedes:</Label>
                        <Select
                          value={(guestsCount[room.id] || 1).toString()}
                          onValueChange={(value) => handleGuestsCountChange(room.id, value)}
                        >
                          <SelectTrigger className="w-20 sm:w-24 touch-manipulation h-10 sm:h-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs sm:text-sm text-gray-500">/ {room.capacity}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sección de Descuentos */}
          {selectedRooms.length > 0 && (
            <Card>
              <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Percent className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                  <h3 className="text-base sm:text-lg font-medium">Descuentos</h3>
                </div>

                {/* Información del huésped */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs sm:text-sm">
                      <p className="text-blue-800 font-medium">
                        {guest.first_name} {guest.last_name}
                        {guest.is_associated && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Asociado
                          </Badge>
                        )}
                      </p>
                      {guest.is_associated && guest.discount_percentage > 0 && (
                        <p className="text-blue-700 mt-1 text-xs sm:text-sm">
                          Descuento por defecto: {guest.discount_percentage}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkbox para huésped asociado */}
                  {guest.is_associated && (
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Checkbox
                        id="apply-associated-discount"
                        checked={discountPercentage > 0}
                        onCheckedChange={handleAssociatedDiscountToggle}
                      />
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <Label htmlFor="apply-associated-discount" className="text-xs sm:text-sm cursor-pointer text-green-800 font-medium">
                          Aplicar descuento de huésped asociado
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de descuento */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Descuento para estas reservas</Label>
                  <Select
                    value={discountPercentage.toString()}
                    onValueChange={handleDiscountChange}
                  >
                    <SelectTrigger className="touch-manipulation h-12 sm:h-auto">
                      <SelectValue placeholder="Seleccionar descuento" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {discountPercentage > 0 && (
                    <div className="text-xs sm:text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      💰 Descuento del {discountPercentage}% aplicado a todas las habitaciones
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen con descuentos */}
          {selectedRooms.length > 0 && checkIn && checkOut && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900 text-sm sm:text-base">
                        {selectedRooms.length} habitación(es) seleccionada(s)
                      </div>
                      <div className="text-xs sm:text-sm text-blue-700">
                        {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
                      </div>
                    </div>
                  </div>

                  {/* Desglose de precios */}
                  <div className="space-y-2 border-t pt-2 sm:pt-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Subtotal:</span>
                      <span>${totalCalculation.subtotal.toLocaleString()}</span>
                    </div>
                    
                    {totalCalculation.discount > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm text-green-600">
                        <span>Descuento ({discountPercentage}%):</span>
                        <span>-${totalCalculation.discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t pt-2">
                      <div className="flex items-center gap-2 text-blue-900">
                        <DollarSign className="h-4 sm:h-5 w-4 sm:w-5" />
                        <span className="text-lg sm:text-xl font-bold">Total:</span>
                      </div>
                      <span className={`text-lg sm:text-xl font-bold ${totalCalculation.discount > 0 ? 'text-green-600' : 'text-blue-900'}`}>
                        ${totalCalculation.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="touch-manipulation h-12 sm:h-auto px-4 sm:px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedRooms.length === 0 || !checkIn || !checkOut || isSubmitting}
            className="touch-manipulation h-12 sm:h-auto px-4 sm:px-6"
          >
            {isSubmitting ? 'Creando...' : `Crear ${selectedRooms.length} Reserva(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
