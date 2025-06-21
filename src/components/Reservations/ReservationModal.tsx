
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, Users, DollarSign } from 'lucide-react';

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

  const calculateTotal = () => {
    const selectedRoom = rooms.find(r => r.id === formData.room_id);
    if (!selectedRoom || !formData.check_in || !formData.check_out) return 0;
    
    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return selectedRoom.price * nights;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = calculateTotal();

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
              <Label htmlFor="room_id" className="text-sm font-medium">Habitación</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({...formData, room_id: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccionar habitación" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{room.number} - {getRoomTypeDisplayName(room.type)}</span>
                        <span className="ml-2 text-primary font-medium">${room.price}/noche</span>
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
                onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out" className="text-sm font-medium">Check-out</Label>
              <Input
                type="date"
                value={formData.check_out}
                onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                className="h-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guests_count" className="text-sm font-medium">Número de huéspedes</Label>
              <Input
                type="number"
                min="1"
                value={formData.guests_count}
                onChange={(e) => setFormData({...formData, guests_count: parseInt(e.target.value)})}
                className="h-10"
                required
              />
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
          {formData.room_id && formData.check_in && formData.check_out && (
            <div className="bg-primary/5 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total de la Reserva</span>
                </div>
                <span className="text-xl font-bold text-primary">${calculateTotal()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>
            <Button type="submit" className="px-6">
              {mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
