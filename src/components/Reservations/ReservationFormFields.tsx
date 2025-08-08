import React, { useState } from 'react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarDays, User, Users, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface ReservationFormFieldsProps {
  formData: any;
  guests: Guest[];
  reservations: Reservation[];
  availableRooms: Room[];
  selectedRoom: Room | undefined;
  selectedGuest: Guest | undefined;
  maxCapacity: number;
  availabilityError: string;
  today: string;
  totals: {
    subtotal: number;
    discount: number;
    total: number;
  };
  onFormChange: (field: string, value: any) => void;
  onDateChange: (field: 'check_in' | 'check_out', value: string) => void;
  onRoomChange: (roomId: string) => void;
}

const AssociatedDiscountSection = ({
  selectedGuest,
  formData,
  onFormChange,
}: {
  selectedGuest: Guest;
  formData: any;
  onFormChange: (field: string, value: any) => void;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">
          Huésped asociado - {selectedGuest.discount_percentage}% de descuento aplicado
        </span>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="discount_percentage" className="text-sm text-gray-600">
          Descuento manual:
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            id="discount_percentage"
            value={formData.discount_percentage}
            onChange={(e) => onFormChange('discount_percentage', Number(e.target.value))}
            className="w-20 text-right"
            min="0"
            max="100"
          />
          <span className="text-gray-600">%</span>
        </div>
      </div>
    </div>
  );
};

const DiscountSection = ({
  formData,
  onFormChange,
}: {
  formData: any;
  onFormChange: (field: string, value: any) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="discount_percentage" className="text-sm text-gray-600">
        Descuento:
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          id="discount_percentage"
          value={formData.discount_percentage}
          onChange={(e) => onFormChange('discount_percentage', Number(e.target.value))}
          className="w-20 text-right"
          min="0"
          max="100"
        />
        <span className="text-gray-600">%</span>
      </div>
    </div>
  );
};

const getRoomTypeLabel = (type: string) => {
  const typeLabels = {
    'matrimonial': 'Matrimonial',
    'triple-individual': 'Triple Individual',
    'triple-matrimonial': 'Triple Matrimonial',
    'doble-individual': 'Doble Individual',
    'suite-presidencial-doble': 'Suite Presidencial'
  };
  return typeLabels[type as keyof typeof typeLabels] || type;
};

export const ReservationFormFields = ({
  formData,
  guests,
  reservations,
  availableRooms,
  selectedRoom,
  selectedGuest,
  maxCapacity,
  availabilityError,
  today,
  totals,
  onFormChange,
  onDateChange,
  onRoomChange,
}: ReservationFormFieldsProps) => {
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  const filteredGuests = guests.filter(guest => {
    const searchLower = guestSearchQuery.toLowerCase();
    return (
      guest.first_name.toLowerCase().includes(searchLower) ||
      guest.last_name.toLowerCase().includes(searchLower) ||
      guest.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleGuestSelect = (guestId: string) => {
    onFormChange('guest_id', guestId);
    setGuestSearchQuery('');
    setIsGuestDropdownOpen(false);
  };

  return (
    <form className="space-y-4 sm:space-y-6">
      {/* Guest Selection */}
      <div className="space-y-2">
        <Label htmlFor="guest_id" className="text-sm font-medium">
          Huésped *
        </Label>
        <Popover open={isGuestDropdownOpen} onOpenChange={setIsGuestDropdownOpen}>
          <PopoverTrigger asChild>
            <Input
              id="guest_id"
              placeholder="Buscar huésped por nombre, apellido o email..."
              value={selectedGuest ? `${selectedGuest.first_name} ${selectedGuest.last_name} (${selectedGuest.email})` : guestSearchQuery}
              onChange={(e) => {
                setGuestSearchQuery(e.target.value);
                onFormChange('guest_id', '');
              }}
              onFocus={() => setIsGuestDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsGuestDropdownOpen(false), 100)}
            />
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-none shadow-md">
            {filteredGuests.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No se encontraron huéspedes
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {filteredGuests.map(guest => (
                  <button
                    key={guest.id}
                    className="w-full flex items-start gap-2 p-3 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => handleGuestSelect(guest.id)}
                  >
                    <User className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{guest.first_name} {guest.last_name}</span>
                      <span className="text-xs text-gray-500">{guest.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="check_in" className="text-sm font-medium">
            Check-in *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="check_in"
                placeholder="Seleccione fecha de check-in"
                value={formData.check_in ? format(new Date(formData.check_in), 'yyyy-MM-dd') : ''}
                className="text-sm"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-md">
              <Calendar
                mode="single"
                selected={formData.check_in ? new Date(formData.check_in) : undefined}
                onSelect={(date) => onDateChange('check_in', format(date!, 'yyyy-MM-dd'))}
                disabled={(date) => date < new Date(today)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="check_out" className="text-sm font-medium">
            Check-out *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="check_out"
                placeholder="Seleccione fecha de check-out"
                value={formData.check_out ? format(new Date(formData.check_out), 'yyyy-MM-dd') : ''}
                className="text-sm"
                readOnly
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-md">
              <Calendar
                mode="single"
                selected={formData.check_out ? new Date(formData.check_out) : undefined}
                onSelect={(date) => onDateChange('check_out', format(date!, 'yyyy-MM-dd'))}
                disabled={(date) => date < new Date(formData.check_in || today)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Room Selection */}
      <div className="space-y-2">
        <Label htmlFor="room_id" className="text-sm font-medium">
          Habitación *
        </Label>
        <Select 
          value={formData.room_id} 
          onValueChange={onRoomChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione una habitación" />
          </SelectTrigger>
          <SelectContent>
            {availableRooms.length === 0 ? (
              <SelectItem value="" disabled>
                No hay habitaciones disponibles
              </SelectItem>
            ) : (
              availableRooms.map(room => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      Hab. {room.number} - {getRoomTypeLabel(room.type)}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {room.capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${room.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedRoom && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Detalles de la habitación</h4>
              <Badge variant="outline">{getRoomTypeLabel(selectedRoom.type)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Capacidad: {selectedRoom.capacity} personas</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>Precio: ${selectedRoom.price.toLocaleString()}/noche</span>
              </div>
            </div>
            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Amenidades:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedRoom.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guests Count */}
      <div className="space-y-2">
        <Label htmlFor="guests_count" className="text-sm font-medium">
          Cantidad de huéspedes *
        </Label>
        <Input
          type="number"
          id="guests_count"
          value={formData.guests_count}
          onChange={(e) => onFormChange('guests_count', Number(e.target.value))}
          className="w-24 text-right"
          min="1"
          max={maxCapacity}
        />
        {formData.guests_count > maxCapacity && (
          <p className="text-xs text-red-500">
            La capacidad máxima para esta habitación es de {maxCapacity} huéspedes
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          Estado
        </Label>
        <Select value={formData.status} onValueChange={(value) => onFormChange('status', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="checked-in">Check-in</SelectItem>
            <SelectItem value="checked-out">Check-out</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="special_requests" className="text-sm font-medium">
          Solicitudes especiales
        </Label>
        <Input
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => onFormChange('special_requests', e.target.value)}
          placeholder="Alergias, cuna, etc."
        />
      </div>

      {/* Discount and Total Section - Updated to work with both single and multi-room */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        {selectedGuest && (
          <>
            {selectedGuest.is_associated ? (
              <AssociatedDiscountSection
                selectedGuest={selectedGuest}
                formData={formData}
                onFormChange={onFormChange}
              />
            ) : (
              <DiscountSection
                formData={formData}
                onFormChange={onFormChange}
              />
            )}
          </>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${totals.subtotal.toLocaleString()}</span>
          </div>
          
          {totals.discount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Descuento ({formData.discount_percentage}%):</span>
              <span>-${totals.discount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span className="text-blue-600">${totals.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </form>
  );
};
