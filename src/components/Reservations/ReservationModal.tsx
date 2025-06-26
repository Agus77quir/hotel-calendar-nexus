
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: any) => void;
  rooms: Room[];
  guests: Guest[];
  reservation?: Reservation;
  mode: 'create' | 'edit';
}

const getRoomTypeDisplayName = (type: Room['type']) => {
  switch (type) {
    case 'matrimonial':
      return 'Matrimonial';
    case 'triple-individual':
      return 'Triple Individual';
    case 'triple-matrimonial':
      return 'Triple Matrimonial';
    case 'doble-individual':
      return 'Doble Individual';
    case 'suite-presidencial-doble':
      return 'Suite Presidencial Doble';
    default:
      return type;
  }
};

export const ReservationModal = ({
  isOpen,
  onClose,
  onSave,
  rooms,
  guests,
  reservation,
  mode
}: ReservationModalProps) => {
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in: '',
    check_out: '',
    guests_count: 1,
    status: 'confirmed' as 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled',
    special_requests: '',
  });

  const [availabilityError, setAvailabilityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reservation && mode === 'edit') {
      setFormData({
        guest_id: reservation.guest_id,
        room_id: reservation.room_id,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        guests_count: reservation.guests_count,
        status: reservation.status,
        special_requests: reservation.special_requests || '',
      });
    } else {
      setFormData({
        guest_id: '',
        room_id: '',
        check_in: '',
        check_out: '',
        guests_count: 1,
        status: 'confirmed',
        special_requests: '',
      });
    }
    setAvailabilityError('');
  }, [reservation, mode, isOpen]);

  // Get selected room details
  const selectedRoom = rooms.find(r => r.id === formData.room_id);
  const maxCapacity = selectedRoom ? selectedRoom.capacity : 1;

  // Check if dates overlap
  const datesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && end1 > start2;
  };

  // Filter available rooms based on dates and existing reservations
  const getAvailableRooms = () => {
    // If no dates selected, show only available rooms
    if (!formData.check_in || !formData.check_out) {
      return rooms.filter(room => room.status === 'available');
    }

    return rooms.filter(room => {
      // Room must be available
      if (room.status !== 'available') {
        return false;
      }

      // For editing, allow the current room even if it has reservations
      if (mode === 'edit' && room.id === formData.room_id) {
        return true;
      }

      // Check if room has any overlapping reservations for the selected dates
      // This would need to be implemented with actual reservation data checking
      // For now, we'll rely on the backend constraint to handle this
      return true;
    });
  };

  const availableRooms = getAvailableRooms();

  // Handle room change - adjust guest count if it exceeds new room capacity
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const newMaxCapacity = room ? room.capacity : 1;
    
    setFormData(prev => ({
      ...prev,
      room_id: roomId,
      guests_count: prev.guests_count > newMaxCapacity ? newMaxCapacity : prev.guests_count
    }));
    
    // Clear availability error when room changes
    setAvailabilityError('');
  };

  // Handle date changes - reset room selection and clear errors
  const handleDateChange = (field: 'check_in' | 'check_out', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset room selection when dates change to force user to reselect
      room_id: field === 'check_in' || field === 'check_out' ? '' : prev.room_id
    }));
    setAvailabilityError('');
  };

  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    if (!selectedRoom || !formData.check_in || !formData.check_out) return 0;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoom.price * nights;
  };

  const validateDates = () => {
    if (!formData.check_in || !formData.check_out) return true;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    
    return checkOut > checkIn;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
      setAvailabilityError('La fecha de check-out debe ser posterior a la fecha de check-in');
      return;
    }

    if (!formData.room_id) {
      setAvailabilityError('Debe seleccionar una habitación disponible para las fechas indicadas');
      return;
    }
    
    setIsSubmitting(true);
    setAvailabilityError('');

    try {
      const totalAmount = calculateTotal();

      const reservationData = {
        ...formData,
        total_amount: totalAmount,
        created_by: 'current-user-id', // This should come from auth context
      };

      await onSave(reservationData);
      onClose();
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      
      // Handle specific database constraint errors
      if (error.message && (error.message.includes('no_overlapping_reservations') || 
          error.message.includes('Ya existe una reserva'))) {
        setAvailabilityError('Habitación ya reservada, elija otra. Esta habitación no está disponible para las fechas seleccionadas.');
      } else {
        setAvailabilityError(error.message || 'Error al crear la reserva. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {mode === 'create' ? 'Nueva Reserva' : 'Editar Reserva'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Complete los detalles de la reserva
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {availabilityError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guest_id" className="text-sm font-medium">Huésped</Label>
              <Select value={formData.guest_id} onValueChange={(value) => setFormData({...formData, guest_id: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar huésped" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {guest.first_name} {guest.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_id" className="text-sm font-medium">
                Habitación
                {formData.check_in && formData.check_out && availableRooms.length === 0 && (
                  <span className="text-red-500 text-xs ml-2">
                    (No hay habitaciones disponibles para estas fechas)
                  </span>
                )}
                {(!formData.check_in || !formData.check_out) && (
                  <span className="text-amber-500 text-xs ml-2">
                    (Seleccione fechas primero)
                  </span>
                )}
              </Label>
              <Select 
                value={formData.room_id} 
                onValueChange={handleRoomChange}
                disabled={!formData.check_in || !formData.check_out || availableRooms.length === 0}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar habitación" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{room.number} - {getRoomTypeDisplayName(room.type)}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">Max: {room.capacity}</span>
                          <span className="text-primary font-medium">${room.price}/noche</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="check_in" className="text-sm font-medium">Check-in</Label>
              <Input
                type="date"
                value={formData.check_in}
                onChange={(e) => handleDateChange('check_in', e.target.value)}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out" className="text-sm font-medium">Check-out</Label>
              <Input
                type="date"
                value={formData.check_out}
                onChange={(e) => handleDateChange('check_out', e.target.value)}
                className="h-10"
                required
                min={formData.check_in}
              />
            </div>
          </div>

          {!validateDates() && formData.check_in && formData.check_out && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-red-700 text-sm">
                La fecha de check-out debe ser posterior a la fecha de check-in
              </p>
            </div>
          )}

          {formData.check_in && formData.check_out && validateDates() && availableRooms.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="text-amber-700 text-sm">
                No hay habitaciones disponibles para las fechas seleccionadas. Por favor, elija otras fechas.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guests_count" className="text-sm font-medium">
                Número de huéspedes
                {selectedRoom && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Máximo: {maxCapacity})
                  </span>
                )}
              </Label>
              <Input
                type="number"
                min="1"
                max={maxCapacity}
                value={formData.guests_count || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const clampedValue = Math.min(Math.max(value, 1), maxCapacity);
                  setFormData({...formData, guests_count: clampedValue});
                }}
                className="h-10"
                required
                disabled={!formData.room_id}
              />
              {!formData.room_id && (
                <p className="text-xs text-muted-foreground">
                  Selecciona una habitación primero
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
              <Select value={formData.status} onValueChange={(value: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled') => setFormData({...formData, status: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="checked-in">Registrado</SelectItem>
                  <SelectItem value="checked-out">Check-out</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests" className="text-sm font-medium">Solicitudes especiales</Label>
            <Textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              placeholder="Solicitudes especiales del huésped..."
              className="min-h-[80px]"
            />
          </div>

          {/* Total Amount Display */}
          {formData.room_id && formData.check_in && formData.check_out && validateDates() && (
            <div className="bg-primary/5 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total de la Reserva</span>
                </div>
                <span className="text-xl font-bold text-primary">${calculateTotal()}</span>
              </div>
              {selectedRoom && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Habitación {selectedRoom.number} - {formData.guests_count} huésped{formData.guests_count > 1 ? 'es' : ''}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-6"
              disabled={!validateDates() || isSubmitting || !formData.room_id}
            >
              {isSubmitting 
                ? 'Guardando...' 
                : mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
