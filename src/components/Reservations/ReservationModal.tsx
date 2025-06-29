
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { useReservationForm } from '@/hooks/useReservationForm';
import { ReservationFormFields } from './ReservationFormFields';
import { hasDateOverlap } from '@/utils/reservationValidation';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: any) => void;
  rooms: Room[];
  guests: Guest[];
  reservation?: Reservation;
  mode: 'create' | 'edit';
}

export const ReservationModal = ({
  isOpen,
  onClose,
  onSave,
  rooms,
  guests,
  reservation,
  mode
}: ReservationModalProps) => {
  const { reservations } = useHotelData();
  
  const {
    formData,
    availabilityError,
    isSubmitting,
    today,
    selectedRoom,
    maxCapacity,
    availableRooms,
    setAvailabilityError,
    setIsSubmitting,
    handleRoomChange,
    handleDateChange,
    handleFormChange,
    calculateTotal,
    validateDates
  } = useReservationForm({
    rooms,
    guests,
    reservations,
    reservation,
    mode,
    isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
      if (formData.check_in < today) {
        setAvailabilityError('No se pueden hacer reservas para fechas anteriores a hoy');
      } else {
        setAvailabilityError('La fecha de check-out debe ser posterior a la fecha de check-in');
      }
      return;
    }

    if (!formData.room_id) {
      setAvailabilityError('Debe seleccionar una habitación disponible para las fechas indicadas');
      return;
    }

    // Final validation for room availability
    const hasOverlap = hasDateOverlap(
      formData.room_id, 
      formData.check_in, 
      formData.check_out, 
      reservations,
      reservation?.id
    );
    if (hasOverlap) {
      setAvailabilityError('Habitación ya reservada, elija otra');
      return;
    }
    
    setIsSubmitting(true);
    setAvailabilityError('');

    try {
      const totalAmount = calculateTotal();

      const reservationData = {
        ...formData,
        total_amount: totalAmount,
        created_by: 'current-user-id', // This should come from auth context
      };

      await onSave(reservationData);
      onClose();
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      
      // Handle specific database constraint errors
      if (error.message && (error.message.includes('no_overlapping_reservations') || 
          error.message.includes('Ya existe una reserva'))) {
        setAvailabilityError('Habitación ya reservada, elija otra');
      } else {
        setAvailabilityError(error.message || 'Error al crear la reserva. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {availabilityError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}

          <ReservationFormFields
            formData={formData}
            guests={guests}
            rooms={rooms}
            availableRooms={availableRooms}
            selectedRoom={selectedRoom}
            maxCapacity={maxCapacity}
            today={today}
            onFormChange={handleFormChange}
            onDateChange={handleDateChange}
            onRoomChange={handleRoomChange}
            validateDates={validateDates}
            calculateTotal={calculateTotal}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-6"
              disabled={!validateDates() || isSubmitting || !formData.room_id}
            >
              {isSubmitting 
                ? 'Guardando...' 
                : mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
