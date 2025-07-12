
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Percent } from 'lucide-react';
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
  
  const handleAssociationChange = (checked: boolean | string) => {
    const isChecked = checked === true;
    console.log('Association checkbox changed:', isChecked);
    onAssociationChange(isChecked);
    if (!isChecked) {
      onDiscountChange(0);
    }
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseInt(value) || 0;
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

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Descuentos y Beneficios
        </h4>
        
        <div className="space-y-4">
          {/* Checkbox para marcar como asociado */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_associated"
              checked={isAssociated}
              onCheckedChange={handleAssociationChange}
            />
            <Label htmlFor="is_associated" className="text-sm cursor-pointer">
              Aplicar descuento de huésped asociado
              {selectedGuest?.is_associated && (
                <span className="ml-2 text-green-600 text-xs">(Huésped registrado como asociado)</span>
              )}
            </Label>
          </div>

          {/* Selector de porcentaje de descuento */}
          {isAssociated && (
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Porcentaje de descuento
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
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  Se aplicará un descuento del {discountPercentage}% al total de la reserva
                </div>
              )}
            </div>
          )}

          {/* Información del huésped */}
          {selectedGuest?.is_associated && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
              💡 Este huésped está registrado como asociado y puede recibir descuentos especiales
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
