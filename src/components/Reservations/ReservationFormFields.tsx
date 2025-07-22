
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GuestSearchInput } from './GuestSearchInput';
import { Guest, Room } from '@/types/hotel';

interface ReservationFormFieldsProps {
  formData: {
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    special_requests: string;
  };
  rooms: Room[];
  selectedGuest: Guest | null;
  onFormChange: (field: string, value: any) => void;
  onGuestSelect: (guest: Guest | null) => void;
}

export const ReservationFormFields = ({ 
  formData, 
  rooms, 
  selectedGuest,
  onFormChange, 
  onGuestSelect 
}: ReservationFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="guest">Huésped *</Label>
        <GuestSearchInput
          selectedGuest={selectedGuest}
          onGuestSelect={onGuestSelect}
        />
      </div>

      <div>
        <Label htmlFor="room_id">Habitación *</Label>
        <Select value={formData.room_id} onValueChange={(value) => onFormChange('room_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar habitación" />
          </SelectTrigger>
          <SelectContent>
            {rooms.filter(room => room.status === 'available').map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.number} - {room.type} (${room.price}/noche)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in">Check-in *</Label>
          <Input
            id="check_in"
            type="date"
            value={formData.check_in}
            onChange={(e) => onFormChange('check_in', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="check_out">Check-out *</Label>
          <Input
            id="check_out"
            type="date"
            value={formData.check_out}
            onChange={(e) => onFormChange('check_out', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests_count">Número de huéspedes *</Label>
        <Input
          id="guests_count"
          type="number"
          min="1"
          value={formData.guests_count}
          onChange={(e) => onFormChange('guests_count', parseInt(e.target.value) || 1)}
          required
        />
      </div>

      <div>
        <Label htmlFor="special_requests">Solicitudes especiales</Label>
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => onFormChange('special_requests', e.target.value)}
          placeholder="Ingrese cualquier solicitud especial..."
          rows={3}
        />
      </div>
    </div>
  );
};
