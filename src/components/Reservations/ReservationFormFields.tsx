import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, DollarSign, Percent } from 'lucide-react';
import { Room, Guest } from '@/types/hotel';

interface ReservationFormFieldsProps {
  formData: {
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
    special_requests: string;
    is_associated: boolean;
    discount_percentage: number;
  };
  guests: Guest[];
  rooms: Room[];
  availableRooms: Room[];
  selectedRoom: Room | undefined;
  selectedGuest: Guest | undefined;
  maxCapacity: number;
  today: string;
  onFormChange: (field: string, value: any) => void;
  onDateChange: (field: 'check_in' | 'check_out', value: string) => void;
  onRoomChange: (roomId: string) => void;
  validateDates: () => boolean;
  calculateTotal: () => number;
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

export const ReservationFormFields = ({
  formData,
  guests,
  rooms,
  availableRooms,
  selectedRoom,
  selectedGuest,
  maxCapacity,
  today,
  onFormChange,
  onDateChange,
  onRoomChange,
  validateDates,
  calculateTotal
}: ReservationFormFieldsProps) => {
  
  const handleGuestChange = (guestId: string) => {
    onFormChange('guest_id', guestId);
    
    // Auto-update association status when guest changes (but not discount percentage)
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      console.log('Guest selected:', {
        name: `${guest.first_name} ${guest.last_name}`,
        is_associated: guest.is_associated || false,
        default_discount: guest.discount_percentage || 0
      });
      
      // Only update the association status, let staff choose discount manually
      onFormChange('is_associated', guest.is_associated || false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="guest_id" className="text-sm font-medium">Huésped</Label>
        <Select value={formData.guest_id} onValueChange={handleGuestChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Seleccionar huésped" />
          </SelectTrigger>
          <SelectContent>
            {guests.map((guest) => (
              <SelectItem key={guest.id} value={guest.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{guest.first_name} {guest.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {guest.is_associated && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Asociado
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-blue-900 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Configuración de Descuento
          </h4>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_associated"
              checked={formData.is_associated}
              onCheckedChange={(checked) => {
                console.log('Association status changed:', checked);
                onFormChange('is_associated', !!checked);
                // Reset discount when unchecking association
                if (!checked) {
                  onFormChange('discount_percentage', 0);
                }
              }}
            />
            <Label htmlFor="is_associated" className="text-sm">
              Huésped Asociado
              {selectedGuest?.is_associated && (
                <span className="ml-2 text-green-600 text-xs">(Huésped registrado como asociado)</span>
              )}
            </Label>
          </div>

          {formData.is_associated && (
            <div className="space-y-2">
              <Label htmlFor="discount_percentage" className="text-sm">
                Porcentaje de Descuento
                {selectedGuest?.discount_percentage && (
                  <span className="ml-2 text-blue-600 text-xs">
                    (Descuento sugerido del huésped: {selectedGuest.discount_percentage}%)
                  </span>
                )}
              </Label>
              <Select 
                value={formData.discount_percentage.toString()}
                onValueChange={(value) => {
                  console.log('Discount percentage manually selected:', value);
                  onFormChange('discount_percentage', parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar descuento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% - Sin descuento</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="35">35%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="45">45%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="55">55%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="check_in" className="text-sm font-medium">Check-in</Label>
          <Input
            type="date"
            value={formData.check_in}
            onChange={(e) => onDateChange('check_in', e.target.value)}
            className="h-10"
            required
            min={today}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="check_out" className="text-sm font-medium">Check-out</Label>
          <Input
            type="date"
            value={formData.check_out}
            onChange={(e) => onDateChange('check_out', e.target.value)}
            className="h-10"
            required
            min={formData.check_in || today}
          />
        </div>
      </div>

      {(formData.check_in < today || formData.check_out < today) && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <p className="text-red-700 text-sm">
            No se pueden hacer reservas para fechas anteriores a hoy ({today})
          </p>
        </div>
      )}

      {!validateDates() && formData.check_in && formData.check_out && formData.check_in >= today && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <p className="text-red-700 text-sm">
            La fecha de check-out debe ser posterior a la fecha de check-in
          </p>
        </div>
      )}

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
          onValueChange={onRoomChange}
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
              onFormChange('guests_count', clampedValue);
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
          <Select value={formData.status} onValueChange={(value: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled') => onFormChange('status', value)}>
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
          onChange={(e) => onFormChange('special_requests', e.target.value)}
          placeholder="Solicitudes especiales del huésped..."
          className="min-h-[80px]"
        />
      </div>

      {formData.room_id && formData.check_in && formData.check_out && validateDates() && (
        <div className="bg-primary/5 p-4 rounded-lg border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-medium">Resumen de Costos</span>
              </div>
            </div>
            
            {selectedRoom && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Habitación {selectedRoom.number} - {formData.guests_count} huésped{formData.guests_count > 1 ? 'es' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio por noche:</span>
                  <span>${selectedRoom.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Noches:</span>
                  <span>{Math.ceil((new Date(formData.check_out).getTime() - new Date(formData.check_in).getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(selectedRoom.price * Math.ceil((new Date(formData.check_out).getTime() - new Date(formData.check_in).getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)}</span>
                </div>
                {formData.is_associated && formData.discount_percentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({formData.discount_percentage}%):</span>
                    <span>-${((selectedRoom.price * Math.ceil((new Date(formData.check_out).getTime() - new Date(formData.check_in).getTime()) / (1000 * 60 * 60 * 24))) * formData.discount_percentage / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-lg font-bold">TOTAL:</span>
              <span className="text-xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
