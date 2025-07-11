
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent } from 'lucide-react';
import { Guest } from '@/types/hotel';

interface AssociatedDiscountSectionProps {
  isAssociated: boolean;
  discountPercentage: number;
  selectedGuest: Guest | undefined;
  onAssociationChange: (checked: boolean) => void;
  onDiscountChange: (value: number) => void;
}

export const AssociatedDiscountSection = ({
  isAssociated,
  discountPercentage,
  selectedGuest,
  onAssociationChange,
  onDiscountChange
}: AssociatedDiscountSectionProps) => {
  
  const handleAssociationChange = (checked: boolean) => {
    onAssociationChange(checked);
    if (!checked) {
      onDiscountChange(0);
    } else if (selectedGuest?.discount_percentage) {
      onDiscountChange(selectedGuest.discount_percentage);
    }
  };

  const handleDiscountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    onDiscountChange(numValue);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Configuración de Descuento
        </h4>
        
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

        {isAssociated && (
          <div className="space-y-2">
            <Label htmlFor="discount_percentage" className="text-sm">
              Porcentaje de Descuento
              {selectedGuest?.discount_percentage && (
                <span className="ml-2 text-blue-600 text-xs">
                  (Descuento sugerido: {selectedGuest.discount_percentage}%)
                </span>
              )}
            </Label>
            <Select 
              value={discountPercentage.toString()}
              onValueChange={handleDiscountChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar descuento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% - Sin descuento</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
                <SelectItem value="35">35%</SelectItem>
                <SelectItem value="40">40%</SelectItem>
                <SelectItem value="45">45%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="55">55%</SelectItem>
                <SelectItem value="60">60%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
