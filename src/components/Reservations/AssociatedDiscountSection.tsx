
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck } from 'lucide-react';
import { Guest } from '@/types/hotel';

interface AssociatedDiscountSectionProps {
  isAssociated: boolean;
  selectedGuest: Guest | undefined;
  onAssociationChange: (checked: boolean) => void;
}

export const AssociatedDiscountSection = ({
  isAssociated,
  selectedGuest,
  onAssociationChange
}: AssociatedDiscountSectionProps) => {
  
  const handleAssociationChange = (checked: boolean) => {
    onAssociationChange(checked);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Huésped Asociado
        </h4>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_associated"
            checked={isAssociated}
            onCheckedChange={handleAssociationChange}
          />
          <Label htmlFor="is_associated" className="text-sm cursor-pointer">
            Marcar como huésped asociado
            {selectedGuest?.is_associated && (
              <span className="ml-2 text-green-600 text-xs">(Huésped registrado como asociado)</span>
            )}
          </Label>
        </div>
      </div>
    </div>
  );
};
