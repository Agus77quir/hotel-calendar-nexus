
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Percent, Info } from 'lucide-react';
import { Guest } from '@/types/hotel';

interface AssociatedDiscountSectionProps {
  isAssociated: boolean;
  selectedGuest: Guest | undefined;
  discountPercentage: number;
  onAssociationChange: (checked: boolean) => void;
  onDiscountChange: (percentage: number) => void;
}

export const AssociatedDiscountSection = ({
  isAssociated,
  selectedGuest,
  discountPercentage,
  onAssociationChange,
  onDiscountChange
}: AssociatedDiscountSectionProps) => {
  
  const handleAssociationChange = (checked: boolean) => {
    console.log('Association checkbox changed:', checked);
    onAssociationChange(checked);
    if (!checked) {
      onDiscountChange(0);
    } else if (selectedGuest?.discount_percentage) {
      // If enabling and guest has a default discount, suggest it
      onDiscountChange(selectedGuest.discount_percentage);
    }
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseInt(value);
    console.log('Discount percentage changed:', percentage);
    onDiscountChange(percentage);
  };

  const discountOptions = [
    { value: '0', label: 'Sin descuento (0%)' },
    { value: '5', label: '5% de descuento' },
    { value: '10', label: '10% de descuento' },
    { value: '15', label: '15% de descuento' },
    { value: '20', label: '20% de descuento' },
    { value: '25', label: '25% de descuento' },
    { value: '30', label: '30% de descuento' },
  ];

  const isGuestAssociated = selectedGuest?.is_associated || false;
  const wasAutoActivated = isGuestAssociated && isAssociated;

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Descuentos y Beneficios
        </h4>
        
        <div className="space-y-4">
          {/* Información automática del huésped asociado */}
          {isGuestAssociated && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-green-800 font-medium">
                  ✅ Huésped asociado detectado automáticamente
                </p>
                <p className="text-green-700 mt-1">
                  {selectedGuest?.first_name} {selectedGuest?.last_name} está registrado como asociado. 
                  El descuento se ha activado automáticamente pero puedes ajustar el porcentaje según necesites.
                </p>
              </div>
            </div>
          )}

          {/* Checkbox para controlar descuento */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_associated"
              checked={isAssociated}
              onCheckedChange={handleAssociationChange}
            />
            <Label htmlFor="is_associated" className="text-sm cursor-pointer">
              Aplicar descuento de huésped asociado
              {wasAutoActivated && (
                <span className="ml-2 text-blue-600 text-xs font-medium">(Activado automáticamente)</span>
              )}
            </Label>
          </div>

          {/* Selector de porcentaje de descuento */}
          {isAssociated && (
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Porcentaje de descuento para esta reserva
              </Label>
              <Select
                value={discountPercentage.toString()}
                onValueChange={handleDiscountPercentageChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar descuento" />
                </SelectTrigger>
                <SelectContent>
                  {discountOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {discountPercentage > 0 && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  💰 Se aplicará un descuento del {discountPercentage}% al total de esta reserva
                </div>
              )}

              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                💡 <strong>Tip:</strong> El porcentaje de descuento puede variar entre reservas del mismo huésped asociado
              </div>
            </div>
          )}

          {/* Información adicional cuando no hay huésped seleccionado o no es asociado */}
          {!selectedGuest && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              ℹ️ Selecciona un huésped para ver las opciones de descuento disponibles
            </div>
          )}

          {selectedGuest && !isGuestAssociated && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              ℹ️ Este huésped no está registrado como asociado. Puedes activar el descuento manualmente si aplica.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
