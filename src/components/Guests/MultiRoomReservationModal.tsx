
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Users, DollarSign, Percent, UserCheck } from 'lucide-react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { formatDisplayDate, getTodayInBuenosAires } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';
import { hasDateOverlap } from '@/utils/reservationValidation';

interface MultiRoomReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  rooms: Room[];
  reservations: Reservation[];
  onCreateReservations: (groupData: {
    guestId: string;
    checkIn: string;
    checkOut: string;
    roomsData: Array<{ roomId: string; guestsCount: number; totalAmount: number }>;
    specialRequests?: string;
  }) => Promise<void>;
}

export const MultiRoomReservationModal = ({
  isOpen,
  onClose,
  guest,
  rooms,
  reservations,
  onCreateReservations
}: MultiRoomReservationModalProps) => {
  const { toast } = useToast();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState<{[key: string]: number}>({});
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = getTodayInBuenosAires();

  // Check if a room is available for the selected dates (date-based, ignore current status)
  const isRoomAvailable = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return false;
    
    // If no dates selected yet, allow selection (we'll validate on submit)
    if (!checkIn || !checkOut) return true;
    
    // Available if there is NO overlap with existing reservations for that room
    const hasOverlap = hasDateOverlap(
      roomId,
      checkIn,
      checkOut,
      reservations
    );
    
    return !hasOverlap;
  };

  // Show all rooms; availability is computed by date overlap
  const displayRooms = rooms;

  // Clear selected rooms that are no longer available when dates change
  useEffect(() => {
    const conflictingRooms = selectedRooms.filter(roomId => !isRoomAvailable(roomId));
    
    if (conflictingRooms.length > 0) {
      setSelectedRooms(prev => prev.filter(roomId => isRoomAvailable(roomId)));
      
      // Remove guests count for conflicting rooms
      setGuestsCount(prev => {
        const newGuestsCount = { ...prev };
        conflictingRooms.forEach(roomId => {
          delete newGuestsCount[roomId];
        });
        return newGuestsCount;
      });

      // Notify which rooms were removed due to conflicts with the selected dates
      const conflictingRoomNumbers = conflictingRooms
        .map(roomId => rooms.find(r => r.id === roomId)?.number || roomId)
        .join(', ');
      toast({
        title: 'Habitaciones no disponibles para estas fechas',
        description: `Se quitaron: ${conflictingRoomNumbers}.`,
      });
    }
  }, [checkIn, checkOut]);

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
        // Prevent selecting rooms with conflicts for chosen dates
        if (checkIn && checkOut) {
          const conflict = hasDateOverlap(roomId, checkIn, checkOut, reservations);
          if (conflict) {
            const room = rooms.find(r => r.id === roomId);
            toast({
              title: 'Habitación no disponible',
              description: `La habitación ${room?.number ?? ''} ya está reservada para estas fechas.`,
            });
            return prev; // do not add conflicting room
          }
        }

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('🚀 INICIANDO SUBMIT DE RESERVAS MÚLTIPLES');
    console.log('📋 HABITACIONES SELECCIONADAS:', selectedRooms);
    console.log('📅 FECHAS:', checkIn, '-', checkOut);
    
    if (selectedRooms.length === 0) {
      toast({
        title: "Seleccione habitaciones",
        description: "Debe seleccionar al menos una habitación",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Fechas requeridas", 
        description: "Debe seleccionar fechas de check-in y check-out",
      });
      return;
    }

    // Validar que el check-in no sea anterior a hoy (zona horaria Buenos Aires)
    if (checkIn < today) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de check-in no puede ser anterior a hoy",
      });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de check-out debe ser posterior al check-in",
      });
      return;
    }

    // Validar disponibilidad detallada
    const conflictingRooms = selectedRooms.filter(roomId => {
      const hasOverlap = hasDateOverlap(roomId, checkIn, checkOut, reservations);
      if (hasOverlap) {
        console.error(`❌ HABITACIÓN ${roomId} TIENE CONFLICTO DE FECHAS`);
      }
      return hasOverlap;
    });

    if (conflictingRooms.length > 0) {
      const conflictingRoomNumbers = conflictingRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        return room?.number || roomId;
      }).join(', ');

      toast({
        title: "Habitaciones no disponibles",
        description: `Las habitaciones ${conflictingRoomNumbers} ya están reservadas para estas fechas.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const roomsData = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const roomSubtotal = Number(room?.price || 0) * nights;
        const roomDiscountAmount = discountPercentage > 0 ? (roomSubtotal * discountPercentage) / 100 : 0;
        const roomTotal = roomSubtotal - roomDiscountAmount;
        
        return {
          roomId: roomId,
          guestsCount: guestsCount[roomId] || 1,
          totalAmount: roomTotal,
        };
      });

      const groupData = {
        guestId: guest.id,
        checkIn: checkIn,
        checkOut: checkOut,
        roomsData: roomsData,
        specialRequests: ''
      };

      console.log('📤 ENVIANDO GRUPO DE RESERVAS MÚLTIPLES:', groupData);
      
      await onCreateReservations(groupData);
      console.log('✅ GRUPO DE RESERVAS MÚLTIPLES CREADO EXITOSAMENTE');
      
      // El toast de éxito se maneja en el componente padre
      onClose();
    } catch (error) {
      console.error('❌ ERROR CREANDO GRUPO DE RESERVAS:', error);
      // El error ya se maneja en el componente padre, no necesitamos toast aquí
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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85svh] sm:max-h-[92dvh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            Reserva Múltiple para {guest.first_name} {guest.last_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full"
                required
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
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Habitaciones disponibles */}
          <div>
            <h3 className="text-lg font-medium mb-4">Seleccionar Habitaciones</h3>
            {!checkIn || !checkOut ? (
              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed mb-4">
                Seleccione las fechas de check-in y check-out para ver la disponibilidad de habitaciones
              </div>
            ) : null}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {displayRooms.map((room) => {
                const available = isRoomAvailable(room.id);
                return (
                  <Card key={room.id} className={`transition-colors ${
                    !available ? 'opacity-60 bg-muted/20' : 
                    selectedRooms.includes(room.id) ? 'ring-2 ring-primary bg-primary/5' : 
                    'hover:bg-muted/50 cursor-pointer'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={selectedRooms.includes(room.id)}
                            onCheckedChange={() => handleRoomToggle(room.id)}
                            disabled={!available}
                          />
                          <div>
                            <div className="font-medium">Habitación {room.number}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {room.type.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline">
                            ${Number(room.price).toLocaleString()}
                          </Badge>
                          {checkIn && checkOut && (
                            <Badge variant={available ? "default" : "destructive"} className="text-xs">
                              {available ? "Disponible" : "Ocupada"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {selectedRooms.includes(room.id) && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Huéspedes:</Label>
                          <Select
                            value={(guestsCount[room.id] || 1).toString()}
                            onValueChange={(value) => handleGuestsCountChange(room.id, value)}
                          >
                            <SelectTrigger className="w-24">
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
                          <span className="text-sm text-muted-foreground">/ {room.capacity}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sección de Descuentos */}
          {selectedRooms.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Descuentos</h3>
                </div>

                {/* Información del huésped */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="text-sm">
                      <p className="text-primary font-medium">
                        {guest.first_name} {guest.last_name}
                        {guest.is_associated && (
                          <Badge variant="outline" className="ml-2">
                            Asociado
                          </Badge>
                        )}
                      </p>
                      {guest.is_associated && guest.discount_percentage > 0 && (
                        <p className="text-primary/80 mt-1">
                          Descuento por defecto: {guest.discount_percentage}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkbox para huésped asociado */}
                  {guest.is_associated && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Checkbox
                        id="apply-associated-discount"
                        checked={discountPercentage > 0}
                        onCheckedChange={handleAssociatedDiscountToggle}
                      />
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <Label htmlFor="apply-associated-discount" className="cursor-pointer text-green-800 font-medium">
                          Aplicar descuento de huésped asociado
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de descuento */}
                <div className="space-y-2">
                  <Label>Descuento para estas reservas</Label>
                  <Select
                    value={discountPercentage.toString()}
                    onValueChange={handleDiscountChange}
                  >
                    <SelectTrigger className="w-full">
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
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      💰 Descuento del {discountPercentage}% aplicado a todas las habitaciones
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen con descuentos */}
          {selectedRooms.length > 0 && checkIn && checkOut && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary">
                        {selectedRooms.length} habitación(es) seleccionada(s)
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
                      </div>
                    </div>
                  </div>

                  {/* Desglose de precios */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totalCalculation.subtotal.toLocaleString()}</span>
                    </div>
                    
                    {totalCalculation.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento ({discountPercentage}%):</span>
                        <span>-${totalCalculation.discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t pt-2">
                      <div className="flex items-center gap-2 text-primary">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-xl font-bold">Total:</span>
                      </div>
                      <span className={`text-xl font-bold ${totalCalculation.discount > 0 ? 'text-green-600' : 'text-primary'}`}>
                        ${totalCalculation.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer buttons - Always visible and properly positioned */}
          <div className="sticky bottom-0 bg-background border-t pt-4 mt-6">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={selectedRooms.length === 0 || !checkIn || !checkOut || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Creando...' : `Crear ${selectedRooms.length} Reserva(s)`}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
