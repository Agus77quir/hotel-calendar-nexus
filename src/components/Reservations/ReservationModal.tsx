
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Room, Guest, Reservation } from '@/types/hotel';

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
  }, [reservation, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total amount
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;

    const reservationData = {
      ...formData,
      total_amount: totalAmount,
      created_by: 'current-user-id', // This should come from auth context
    };

    onSave(reservationData);
    onClose();
  };

  const availableRooms = rooms.filter(room => room.status === 'available');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Reserva' : 'Editar Reserva'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guest_id">Huésped</Label>
            <Select value={formData.guest_id} onValueChange={(value) => setFormData({...formData, guest_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar huésped" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.first_name} {guest.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="room_id">Habitación</Label>
            <Select value={formData.room_id} onValueChange={(value) => setFormData({...formData, room_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar habitación" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.number} - {getRoomTypeDisplayName(room.type)} (${room.price}/noche)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_in">Check-in</Label>
              <Input
                type="date"
                value={formData.check_in}
                onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="check_out">Check-out</Label>
              <Input
                type="date"
                value={formData.check_out}
                onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guests_count">Número de huéspedes</Label>
            <Input
              type="number"
              min="1"
              value={formData.guests_count}
              onChange={(e) => setFormData({...formData, guests_count: parseInt(e.target.value)})}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled') => setFormData({...formData, status: value})}>
              <SelectTrigger>
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

          <div>
            <Label htmlFor="special_requests">Solicitudes especiales</Label>
            <Textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              placeholder="Solicitudes especiales..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
