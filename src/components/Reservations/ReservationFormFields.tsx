import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, User, Home, Users, CreditCard, FileText, AlertTriangle, Percent } from 'lucide-react';
import { Room, Guest, Reservation } from '@/types/hotel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  onRoomChange
}: ReservationFormFieldsProps) => {
  const [checkInCalendarOpen, setCheckInCalendarOpen] = useState(false);
  const [checkOutCalendarOpen, setCheckOutCalendarOpen] = useState(false);

  // Función para convertir Date a string de fecha local (YYYY-MM-DD)
  const dateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    if (date) {
      const localDateString = dateToLocalString(date);
      onDateChange('check_in', localDateString);
      setCheckInCalendarOpen(false);
    }
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    if (date) {
      const localDateString = dateToLocalString(date);
      onDateChange('check_out', localDateString);
      setCheckOutCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Guest Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
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
                <SelectValue placeholder="Selecciona un huésped" />
              </SelectTrigger>
              <SelectContent>
                {guests.map(guest => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.first_name} {guest.last_name} - {guest.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGuest && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedGuest.first_name} {selectedGuest.last_name}
                </span>
              </div>
              <div className="text-sm text-blue-700">
                <p>Email: {selectedGuest.email}</p>
                <p>Teléfono: {selectedGuest.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room and Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Habitación y Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_in">Fecha de Entrada *</Label>
              <Popover open={checkInCalendarOpen} onOpenChange={setCheckInCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.check_in && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.check_in ? (
                      format(new Date(formData.check_in), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.check_in ? new Date(formData.check_in) : undefined}
                    onSelect={handleCheckInSelect}
                    disabled={(date) => date < new Date(today)}
                    initialFocus
                    locale={es}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="check_out">Fecha de Salida *</Label>
              <Popover open={checkOutCalendarOpen} onOpenChange={setCheckOutCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.check_out && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.check_out ? (
                      format(new Date(formData.check_out), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.check_out ? new Date(formData.check_out) : undefined}
                    onSelect={handleCheckOutSelect}
                    disabled={(date) => {
                      const checkInDate = formData.check_in ? new Date(formData.check_in) : new Date(today);
                      return date <= checkInDate;
                    }}
                    initialFocus
                    locale={es}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="room_id">Habitación Disponible *</Label>
            {availableRooms.length === 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No hay habitaciones disponibles para las fechas seleccionadas
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={formData.room_id}
                onValueChange={onRoomChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una habitación" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>Habitación {room.number}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary">{room.type}</Badge>
                          <Badge variant="outline">{room.capacity} personas</Badge>
                          <span className="font-medium">${room.price}/noche</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedRoom && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    Habitación {selectedRoom.number}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">{selectedRoom.type}</Badge>
              </div>
              <div className="text-sm text-green-700">
                <p>Capacidad: {selectedRoom.capacity} personas</p>
                <p>Precio: ${selectedRoom.price} por noche</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Count and Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detalles de la Reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guests_count">Número de Huéspedes *</Label>
              <Input
                id="guests_count"
                type="number"
                min="1"
                max={maxCapacity}
                value={formData.guests_count}
                onChange={(e) => onFormChange('guests_count', parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Máximo {maxCapacity} personas para esta habitación
              </p>
            </div>

            <div>
              <Label htmlFor="status">Estado de la Reserva</Label>
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
            <Label htmlFor="discount_percentage">Descuento (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => onFormChange('discount_percentage', parseFloat(e.target.value) || 0)}
                className="pl-10"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="special_requests">Solicitudes Especiales</Label>
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

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Resumen de Precios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            {formData.discount_percentage > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Descuento ({formData.discount_percentage}%):</span>
                <span>-${totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span className="text-green-600">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {availabilityError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{availabilityError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
