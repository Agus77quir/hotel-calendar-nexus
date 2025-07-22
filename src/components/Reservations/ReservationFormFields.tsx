
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GuestSearchInput } from './GuestSearchInput';
import { Guest, Room } from '@/types/hotel';

export interface ReservationFormFieldsProps {
  formData: {
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
    special_requests: string;
    discount_percentage: number;
  };
  rooms: Room[];
  selectedGuest: Guest | null;
  onInputChange: (field: string, value: any) => void;
  onGuestSelect: (guest: Guest) => void;
  onRoomChange: (roomId: string) => void;
}

export const ReservationFormFields: React.FC<ReservationFormFieldsProps> = ({
  formData,
  rooms,
  selectedGuest,
  onInputChange,
  onGuestSelect,
  onRoomChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="guest">Huésped</Label>
        <GuestSearchInput
          selectedGuestId={formData.guest_id}
          onGuestSelect={onGuestSelect}
          placeholder="Buscar huésped..."
        />
      </div>

      <div>
        <Label htmlFor="room">Habitación</Label>
        <Select value={formData.room_id} onValueChange={onRoomChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar habitación" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.number} - {room.type} (${room.pricePerNight}/noche)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in">Fecha de Entrada</Label>
          <Input
            id="check_in"
            type="date"
            value={formData.check_in}
            onChange={(e) => onInputChange('check_in', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="check_out">Fecha de Salida</Label>
          <Input
            id="check_out"
            type="date"
            value={formData.check_out}
            onChange={(e) => onInputChange('check_out', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests_count">Número de Huéspedes</Label>
        <Input
          id="guests_count"
          type="number"
          min="1"
          value={formData.guests_count}
          onChange={(e) => onInputChange('guests_count', parseInt(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="status">Estado</Label>
        <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="checked-in">Check-in</SelectItem>
            <SelectItem value="checked-out">Check-out</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="discount_percentage">Descuento (%)</Label>
        <Input
          id="discount_percentage"
          type="number"
          min="0"
          max="100"
          value={formData.discount_percentage}
          onChange={(e) => onInputChange('discount_percentage', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div>
        <Label htmlFor="special_requests">Solicitudes Especiales</Label>
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => onInputChange('special_requests', e.target.value)}
          placeholder="Ingrese cualquier solicitud especial..."
        />
      </div>
    </div>
  );
};
