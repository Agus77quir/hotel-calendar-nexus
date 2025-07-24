import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, AlertTriangle, Plus } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { useReservationForm } from '@/hooks/useReservationForm';
import { ReservationFormFields } from './ReservationFormFields';
import { NewGuestForm } from './NewGuestForm';
import { hasDateOverlap } from '@/utils/reservationValidation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: any) => void;
  rooms: Room[];
  guests: Guest[];
  reservation?: Reservation;
  mode: 'create' | 'edit';
  preselectedGuestId?: string;
}

export const ReservationModal = ({
  isOpen,
  onClose,
  onSave,
  rooms,
  guests,
  reservation,
  mode,
  preselectedGuestId
}: ReservationModalProps) => {
  const { reservations, addGuest, updateGuest } = useHotelData();
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const { toast } = useToast();
  
  const {
    formData,
    availabilityError,
    isSubmitting,
    today,
    selectedRoom,
    selectedGuest,
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

  // Get totals
  const totals = calculateTotal();

  // Set preselected guest when modal opens
  useEffect(() => {
    if (preselectedGuestId && mode === 'create' && isOpen) {
      handleFormChange('guest_id', preselectedGuestId);
    }
  }, [preselectedGuestId, mode, isOpen, handleFormChange]);

  const handleCreateGuest = async (guestData: any) => {
    setIsCreatingGuest(true);
    try {
      const newGuest = await addGuest(guestData);
      console.log('New guest created:', newGuest);
      
      handleFormChange('guest_id', newGuest.id);
      
      setShowNewGuestForm(false);
      
      toast({
        title: "Huésped creado",
        description: `${newGuest.first_name} ${newGuest.last_name} ha sido creado y seleccionado automáticamente.`,
      });
    } catch (error) {
      console.error('Error creating guest:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el huésped. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGuest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
      return;
    }

    if (!formData.room_id) {
      setAvailabilityError('Debe seleccionar una habitación disponible para las fechas indicadas');
      return;
    }

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
      const reservationData = {
        guest_id: formData.guest_id,
        room_id: formData.room_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests_count: formData.guests_count,
        status: formData.status,
        special_requests: formData.special_requests,
        total_amount: totals.total, // Use calculated total with discount
        created_by: 'current-user-id',
      };

      await onSave(reservationData);

      toast({
        title: mode === 'create' ? "Reserva creada" : "Reserva actualizada",
        description: mode === 'create' 
          ? "Reserva confirmada exitosamente" 
          : "La reserva ha sido actualizada correctamente",
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      
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

  const handleClose = () => {
    setShowNewGuestForm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[100vh] sm:h-[95vh] max-h-[100vh] sm:max-h-[95vh] overflow-hidden flex flex-col p-0 fixed inset-0 sm:inset-2 left-0 top-0 sm:left-1/2 sm:top-1/2 transform-none sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 m-0 sm:m-2 touch-manipulation">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl">
                {mode === 'create' ? 'Nueva Reserva' : 'Editar Reserva'}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {mode === 'create' ? 'Complete los detalles de la reserva' : 'Modifique los detalles de la reserva'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 overscroll-contain -webkit-overflow-scrolling-touch bg-white">
          {availabilityError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}

          {showNewGuestForm ? (
            <NewGuestForm
              onSave={handleCreateGuest}
              onCancel={() => setShowNewGuestForm(false)}
              isSubmitting={isCreatingGuest}
            />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {!preselectedGuestId && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div>
                    <h3 className="font-medium text-blue-900">Crear Huésped Rápido</h3>
                    <p className="text-sm text-blue-700">
                      Se aplicarán automáticamente descuentos y configuraciones
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewGuestForm(true)}
                    className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Huésped
                  </Button>
                </div>
              )}

              <ReservationFormFields
                formData={formData}
                guests={guests}
                reservations={reservations}
                availableRooms={availableRooms}
                selectedRoom={selectedRoom}
                selectedGuest={selectedGuest}
                maxCapacity={maxCapacity}
                availabilityError={availabilityError}
                today={today}
                totals={totals}
                onFormChange={handleFormChange}
                onDateChange={handleDateChange}
                onRoomChange={handleRoomChange}
              />
            </div>
          )}
        </div>

        {!showNewGuestForm && (
          <div className="flex justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-white">
            <Button type="button" variant="outline" onClick={handleClose} className="px-4 sm:px-6 touch-manipulation">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              className="px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-manipulation"
              disabled={!validateDates() || isSubmitting || !formData.room_id}
            >
              {isSubmitting 
                ? 'Procesando...' 
                : mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'
              }
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
