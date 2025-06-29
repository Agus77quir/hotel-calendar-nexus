
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, DollarSign } from 'lucide-react';
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
  };
  guests: Guest[];
  rooms: Room[];
  availableRooms: Room[];
  selectedRoom: Room | undefined;
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
  maxCapacity,
  today,
  onFormChange,
  onDateChange,
  onRoomChange,
  validateDates,
  calculateTotal
}: ReservationFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="guest_id" className="text-sm font-medium">Huésped</Label>
        <Select value={formData.guest_id} onValueChange={(value) => onFormChange('guest_id', value)}>
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
    </>
  );
};
