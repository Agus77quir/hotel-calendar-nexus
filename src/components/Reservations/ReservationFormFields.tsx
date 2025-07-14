
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, MapPin, User, AlertCircle, Bed, DollarSign } from 'lucide-react';
import { Room, Guest } from '@/types/hotel';
import { DiscountSection } from './DiscountSection';

interface ReservationFormFieldsProps {
  formData: {
    guest_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests_count: number;
    status: string;
    special_requests: string;
    discount_percentage: number;
  };
  availableRooms: Room[];
  guests: Guest[];
  selectedRoom: Room | undefined;
  selectedGuest: Guest | undefined;
  maxCapacity: number;
  availabilityError: string;
  today: string;
  totals: { subtotal: number; discount: number; total: number };
  onFormChange: (field: string, value: any) => void;
  onRoomChange: (roomId: string) => void;
  onDateChange: (field: 'check_in' | 'check_out', value: string) => void;
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
  totals,
  onFormChange,
  onRoomChange,
  onDateChange
}: ReservationFormFieldsProps) => {

  const formatRoomType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRoomNumber = (number: string) => {
    // Pad single digit room numbers with leading zero for better visual consistency
    return number.length === 1 ? `0${number}` : number;
  };

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
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar habitación disponible" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availableRooms
                  .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                  .map((room) => (
                  <SelectItem key={room.id} value={room.id} className="py-3">
                    <div className="flex items-center justify-between w-full min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="font-mono text-lg font-semibold text-blue-800">
                            #{formatRoomNumber(room.number)}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium text-gray-900 truncate">
                            {formatRoomType(room.type)}
                          </span>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${room.price}/noche
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-green-100 text-green-800 border-green-200 flex-shrink-0"
                      >
                        Disponible
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoom && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900">Habitación:</span>
                    <span className="font-mono text-lg font-bold text-blue-800">
                      #{formatRoomNumber(selectedRoom.number)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900">Tipo:</span>
                    <span className="text-sm text-blue-800">{formatRoomType(selectedRoom.type)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Capacidad:</span>
                    <span className="text-sm text-blue-800">
                      {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'persona' : 'personas'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Precio:</span>
                    <span className="text-sm font-semibold text-blue-800">${selectedRoom.price}/noche</span>
                  </div>
                </div>
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div className="md:col-span-2 pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-blue-900">Amenidades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRoom.amenities.map((amenity, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-white text-blue-700 border-blue-300"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
              {selectedRoom && (
                <p className="text-xs text-muted-foreground mt-1">
                  Capacidad máxima de la habitación: {selectedRoom.capacity} huésped{selectedRoom.capacity > 1 ? 'es' : ''}
                </p>
              )}
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

      {/* Discount Section */}
      <DiscountSection
        selectedGuest={selectedGuest}
        discountPercentage={formData.discount_percentage}
        onDiscountChange={(percentage) => onFormChange('discount_percentage', percentage)}
        subtotal={totals.subtotal}
        discount={totals.discount}
        total={totals.total}
      />
    </div>
  );
};
