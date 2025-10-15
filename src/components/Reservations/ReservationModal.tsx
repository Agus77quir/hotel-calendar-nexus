import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Room, Guest, Reservation } from '@/types/hotel';
import { CalendarDays, Plus, Grid3X3 } from 'lucide-react';
import { useHotelData } from '@/hooks/useHotelData';
import { useReservationForm } from '@/hooks/useReservationForm';
import { ReservationFormFields } from './ReservationFormFields';
import { ReservationValidationAlert } from './ReservationValidationAlert';
import { NewGuestForm } from './NewGuestForm';
import { MultiRoomReservationModal } from '../Guests/MultiRoomReservationModal';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDisplayDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { reservations, addGuest, updateGuest, addReservation, addReservationGroup } = useHotelData();
  const { user } = useAuth();
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
  const [showMultiRoomModal, setShowMultiRoomModal] = useState(false);
  const [selectedGuestForMultiRoom, setSelectedGuestForMultiRoom] = useState<Guest | null>(null);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const { toast } = useToast();
  
  // Verificar si el usuario puede hacer reservas múltiples
  const canCreateMultipleReservations = user?.email !== 'rec1' && user?.email !== 'rec2';
  
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
    validateDates,
    validateForm,
    isFormValid
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

  // Get validation errors
  const validationErrors = validateForm();

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
        // Intentar seleccionar un huésped existente por documento o teléfono
        const existing = guests.find(
          (g) => g.document === (guestData?.document ?? '') || g.phone === (guestData?.phone ?? '')
        );
        if (existing) {
          handleFormChange('guest_id', existing.id);
          setShowNewGuestForm(false);
          toast({
            title: 'Huésped seleccionado',
            description: `${existing.first_name} ${existing.last_name} ya existía y fue seleccionado automáticamente.`,
          });
          return; // Consideramos éxito al seleccionar existente
        }
        // Superficia el error para que el formulario no limpie y el usuario pueda corregir
        toast({
          title: 'No se pudo crear el huésped',
          description: 'Revisa los datos e inténtalo nuevamente.',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsCreatingGuest(false);
      }
  };

  const handleMultiRoomReservation = () => {
    if (!formData.guest_id) {
      toast({
        title: "Seleccione un huésped",
        description: "Debe seleccionar un huésped antes de crear reservas múltiples",
        variant: "destructive",
      });
      return;
    }

    const guest = guests.find(g => g.id === formData.guest_id);
    if (guest) {
      setSelectedGuestForMultiRoom(guest);
      setShowMultiRoomModal(true);
    }
  };

  const handleCreateMultipleReservations = async (groupData: {
    guestId: string;
    checkIn: string;
    checkOut: string;
    roomsData: Array<{ roomId: string; guestsCount: number; totalAmount: number }>;
    specialRequests?: string;
  }) => {
    try {
      console.log('🔄 CREANDO GRUPO DE RESERVAS DESDE MODAL:', groupData);
      
      const result = await addReservationGroup(groupData);
      console.log('✅ GRUPO DE RESERVAS CREADO EXITOSAMENTE:', result);
      
      // Esperar un momento para que se actualicen los datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mostrar mensaje de éxito
      toast({
        title: "Reservas múltiples creadas",
        description: `Se crearon ${result.created} reservas exitosamente`,
      });
      
      // Cerrar ambos modales
      setShowMultiRoomModal(false);
      onClose();
    } catch (error) {
      console.error('❌ ERROR CREANDO GRUPO DE RESERVAS:', error);
      // No mostrar notificaciones de error para este flujo
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 INICIANDO SUBMIT DE RESERVA:', mode);
    console.log('📋 DATOS DEL FORMULARIO:', formData);
    
    // Validación completa del formulario
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setAvailabilityError(validationErrors[0]);
      console.error('❌ ERRORES DE VALIDACIÓN:', validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setAvailabilityError('');

    try {
      // Construir datos de reserva con validación
      const reservationData = {
        guest_id: formData.guest_id,
        room_id: formData.room_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests_count: formData.guests_count,
        status: formData.status,
        special_requests: formData.special_requests || '',
        total_amount: Math.round(totals.total * 100) / 100,
      };

      console.log('📤 ENVIANDO DATOS DE RESERVA:', reservationData);
      
      // Llamar a onSave que ejecutará la mutación
      await onSave(reservationData);
      console.log('✅ RESERVA GUARDADA EXITOSAMENTE');

      // El toast y cierre se maneja en la página padre
      onClose();
    } catch (error: any) {
      console.error('❌ ERROR AL GUARDAR RESERVA:', error);
      
      // Mostrar error específico sin propagar
      const errorMessage = error.message || 'Error desconocido';
      if (errorMessage.includes('no_overlapping_reservations')) {
        setAvailabilityError('Esta habitación ya está reservada para estas fechas.');
      } else if (errorMessage.includes('invalid_dates')) {
        setAvailabilityError('Las fechas seleccionadas no son válidas.');
      } else {
        setAvailabilityError('No se pudo guardar la reserva. Verifique los datos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowNewGuestForm(false);
    setShowMultiRoomModal(false);
    setSelectedGuestForMultiRoom(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85svh] sm:max-h-[92dvh] overflow-hidden flex flex-col p-0 touch-manipulation">
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

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 overscroll-contain -webkit-overflow-scrolling-touch bg-white pb-32 sm:pb-24">
            <ReservationValidationAlert
              validationErrors={validationErrors}
              isFormValid={isFormValid()}
              availabilityError={availabilityError}
            />

            {showNewGuestForm ? (
              <NewGuestForm
                onSave={handleCreateGuest}
                onCancel={() => setShowNewGuestForm(false)}
                isSubmitting={isCreatingGuest}
              />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Sección de reserva múltiple - Solo en modo crear y para usuarios autorizados */}
                {mode === 'create' && canCreateMultipleReservations && (
                  <div className="flex flex-col items-start justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 gap-3">
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-medium text-purple-900 text-sm sm:text-base">Reserva Múltiple</h3>
                      <p className="text-xs sm:text-sm text-purple-700 mt-1">
                        Crear reservas para múltiples habitaciones con el mismo huésped
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleMultiRoomReservation}
                      disabled={!formData.guest_id}
                      className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-100 touch-manipulation w-full sm:w-auto text-sm px-4 py-3 min-h-[48px] sm:min-h-[44px] flex-shrink-0 justify-center disabled:opacity-50"
                    >
                      <Grid3X3 className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Múltiples Habitaciones</span>
                    </Button>
                  </div>
                )}

                {!preselectedGuestId && (
                  <div className="flex flex-col items-start justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 gap-3">
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-medium text-blue-900 text-sm sm:text-base">Crear Huésped Rápido</h3>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Se aplicarán automáticamente descuentos y configuraciones
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewGuestForm(true)}
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 touch-manipulation w-full sm:w-auto text-sm px-4 py-3 min-h-[48px] sm:min-h-[44px] flex-shrink-0 justify-center"
                    >
                      <Plus className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Nuevo Huésped</span>
                    </Button>
                  </div>
                )}

                <ReservationFormFields
                  formData={formData}
                  rooms={rooms}
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

          {!showNewGuestForm && !showMultiRoomModal && (
            <form onSubmit={handleSubmit}>
              <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t flex-shrink-0 bg-white">
                <Button type="button" variant="outline" onClick={handleClose} className="px-4 sm:px-6 touch-manipulation">
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting 
                    ? 'Procesando...' 
                    : mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva'
                  }
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de reserva múltiple */}
      {selectedGuestForMultiRoom && (
        <MultiRoomReservationModal
          isOpen={showMultiRoomModal}
          onClose={() => {
            setShowMultiRoomModal(false);
            setSelectedGuestForMultiRoom(null);
          }}
          guest={selectedGuestForMultiRoom}
          rooms={rooms}
          reservations={reservations}
          onCreateReservations={handleCreateMultipleReservations}
        />
      )}
    </>
  );
};
