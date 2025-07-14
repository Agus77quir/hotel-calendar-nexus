import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, MapPin, User, DollarSign, AlertCircle } from 'lucide-react';
import { Room, Guest } from '@/types/hotel';
import { AssociatedDiscountSection } from './AssociatedDiscountSection';
import { NonAssociatedGuestActions } from './NonAssociatedGuestActions';

interface ReservationFormFieldsProps {
  formData: {
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: string;
    special_requests: string;
    is_associated: boolean;
    discount_percentage: number;
  };
  availableRooms: Room[];
  guests: Guest[];
  selectedRoom: Room | undefined;
  selectedGuest: Guest | undefined;
  maxCapacity: number;
  availabilityError: string;
  today: string;
  total: number;
  onFormChange: (field: string, value: any) => void;
  onRoomChange: (roomId: string) => void;
  onDateChange: (field: 'check_in' | 'check_out', value: string) => void;
  onApplyTemporaryDiscount?: (percentage: number) => void;
  onAssociateGuest?: (discountPercentage: number) => void;
}

export const ReservationFormFields = ({
  formData,
  availableRooms,
  guests,
  selectedRoom,
  selectedGuest,
  maxCapacity,
  availabilityError,
  today,
  total = 0,
  onFormChange,
  onRoomChange,
  onDateChange,
  onApplyTemporaryDiscount,
  onAssociateGuest
}: ReservationFormFieldsProps) => {

  const calculateDiscountedTotal = () => {
    // Aplicar descuento si está marcado como asociado Y tiene porcentaje de descuento
    if (formData.is_associated && formData.discount_percentage > 0) {
      const discountAmount = (total * formData.discount_percentage) / 100;
      return total - discountAmount;
    }
    return total;
  };

  const getDiscountAmount = () => {
    if (formData.is_associated && formData.discount_percentage > 0) {
      return (total * formData.discount_percentage) / 100;
    }
    return 0;
  };

  const safeTotal = total || 0;
  const safeDiscountedTotal = calculateDiscountedTotal() || 0;
  const safeDiscountAmount = getDiscountAmount() || 0;

  return (
    <div className="space-y-6">
      {/* Guest Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-purple-600" />
            Información del Huésped
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="guest_id">Huésped *</Label>
            <Select
              value={formData.guest_id}
              onValueChange={(value) => onFormChange('guest_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar huésped" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{guest.first_name} {guest.last_name}</span>
                      {guest.is_associated && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Asociado
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGuest && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {selectedGuest.email}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> {selectedGuest.phone}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Habitación y Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availabilityError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{availabilityError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_in">Fecha de entrada *</Label>
              <Input
                id="check_in"
                type="date"
                value={formData.check_in}
                min={today}
                onChange={(e) => onDateChange('check_in', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="check_out">Fecha de salida *</Label>
              <Input
                id="check_out"
                type="date"
                value={formData.check_out}
                min={formData.check_in || today}
                onChange={(e) => onDateChange('check_out', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="room_id">Habitación *</Label>
            <Select
              value={formData.room_id}
              onValueChange={onRoomChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar habitación disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    #{room.number} - {room.type.replace('-', ' ')} (Cap: {room.capacity}, ${room.price}/noche)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoom && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {selectedRoom.type.replace('-', ' ')}
                </div>
                <div>
                  <span className="font-medium">Capacidad:</span> {selectedRoom.capacity} personas
                </div>
                <div>
                  <span className="font-medium">Precio:</span> ${selectedRoom.price}/noche
                </div>
                <div>
                  <span className="font-medium">Amenidades:</span> {selectedRoom.amenities?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            Detalles de la Reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guests_count">Número de huéspedes *</Label>
              <Select
                value={formData.guests_count.toString()}
                onValueChange={(value) => onFormChange('guests_count', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} huésped{num > 1 ? 'es' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormChange('status', value)}
              >
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
          </div>

          <div>
            <Label htmlFor="special_requests">Solicitudes especiales</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => onFormChange('special_requests', e.target.value)}
              placeholder="Solicitudes especiales del huésped..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Nueva sección para huéspedes no asociados */}
      {onApplyTemporaryDiscount && onAssociateGuest && (
        <NonAssociatedGuestActions
          selectedGuest={selectedGuest}
          onApplyDiscount={onApplyTemporaryDiscount}
          onAssociateGuest={onAssociateGuest}
        />
      )}

      {/* Associated Discount Section - Solo para huéspedes ya asociados */}
      {selectedGuest?.is_associated && (
        <AssociatedDiscountSection
          isAssociated={formData.is_associated}
          selectedGuest={selectedGuest}
          discountPercentage={formData.discount_percentage}
          onAssociationChange={(checked) => onFormChange('is_associated', checked)}
          onDiscountChange={(percentage) => onFormChange('discount_percentage', percentage)}
        />
      )}

      {/* Total Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            Resumen de Costos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${safeTotal.toFixed(2)}</span>
            </div>
            
            {formData.is_associated && formData.discount_percentage > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({formData.discount_percentage}%):</span>
                  <span>-${safeDiscountAmount.toFixed(2)}</span>
                </div>
                <hr />
              </>
            )}
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className={formData.is_associated && formData.discount_percentage > 0 ? 'text-green-600' : ''}>
                ${safeDiscountedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
