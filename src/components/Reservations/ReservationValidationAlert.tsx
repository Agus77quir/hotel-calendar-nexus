
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReservationValidationAlertProps {
  validationErrors: string[];
  isFormValid: boolean;
  availabilityError: string;
}

export const ReservationValidationAlert = ({
  validationErrors,
  isFormValid,
  availabilityError
}: ReservationValidationAlertProps) => {
  // Show availability error first if it exists
  if (availabilityError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{availabilityError}</AlertDescription>
      </Alert>
    );
  }

  // Don't show validation errors list - removed the validation errors display

  // Show success message when form is valid and all required fields are filled
  if (isFormValid && validationErrors.length === 0) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Todos los datos están completos. Puedes crear la reserva.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
