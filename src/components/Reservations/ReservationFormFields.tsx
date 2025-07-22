
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GuestSearchInput } from './GuestSearchInput';
import { NewGuestForm } from './NewGuestForm';
import { DiscountSection } from './DiscountSection';
import { Guest, Room } from '@/types/hotel';

interface ReservationFormFieldsProps {
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
  showNewGuestForm: boolean;
  onInputChange: (field: string, value: any) => void;
  onGuestSelect: (guest: Guest) => void;
  onToggleNewGuest: () => void;
  onNewGuestSubmit: (guestData: Omit<Guest, 'id' | 'created_at'>) => Promise<void>;
  onRoomChange: (roomId: string) => void;
}

export const ReservationFormFields = ({
  formData,
  rooms,
  selectedGuest,
  showNewGuestForm,
  onInputChange,
  onGuestSelect,
  onToggleNewGuest,
  onNewGuestSubmit,
  onRoomChange
}: ReservationFormFieldsProps) => {
  const calculateNights = () => {
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in);
      const checkOut = new Date(formData.check_out);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, nights);
    }
    return 1;
  };

  const calculateSubtotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    if (selectedRoom) {
      const nights = calculateNights();
      return selectedRoom.price * nights;
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = (subtotal * formData.discount_percentage) / 100;
    return subtotal - discount;
  };

  return (
    <div className="space-y-4">
      <GuestSearchInput
        selectedGuest={selectedGuest}
        onGuestSelect={onGuestSelect}
      />

      {showNewGuestForm && (
        <NewGuestForm onSubmit={onNewGuestSubmit} onCancel={onToggleNewGuest} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="room_id">Habitación</Label>
          <Select value={formData.room_id} onValueChange={onRoomChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar habitación" />
            </SelectTrigger>
            <SelectContent>
              {rooms.filter(room => room.status === 'available').map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  Habitación {room.number} - {room.type} (${room.price}/noche)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="guests_count">Número de huéspedes</Label>
          <Input
            type="number"
            value={formData.guests_count}
            onChange={(e) => onInputChange('guests_count', parseInt(e.target.value))}
            min="1"
            max="6"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="check_in">Fecha de entrada</Label>
          <Input
            type="date"
            value={formData.check_in}
            onChange={(e) => onInputChange('check_in', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="check_out">Fecha de salida</Label>
          <Input
            type="date"
            value={formData.check_out}
            onChange={(e) => onInputChange('check_out', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Estado</Label>
        <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="checked-in">Registrado</SelectItem>
            <SelectItem value="checked-out">Finalizada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="special_requests">Solicitudes especiales</Label>
        <Textarea
          value={formData.special_requests}
          onChange={(e) => onInputChange('special_requests', e.target.value)}
          placeholder="Solicitudes especiales del huésped"
        />
      </div>

      <DiscountSection
        discount={formData.discount_percentage}
        onDiscountChange={(discount) => onInputChange('discount_percentage', discount)}
        subtotal={calculateSubtotal()}
        total={calculateTotal()}
      />
    </div>
  );
};
