
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

  // Show validation errors
  if (validationErrors.length > 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Complete los siguientes campos:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show success message when form is valid
  if (isFormValid) {
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
