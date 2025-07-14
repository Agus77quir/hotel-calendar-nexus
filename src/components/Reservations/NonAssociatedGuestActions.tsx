
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Percent, Info } from 'lucide-react';
import { useState } from 'react';
import { Guest } from '@/types/hotel';

interface NonAssociatedGuestActionsProps {
  selectedGuest: Guest | undefined;
  onApplyDiscount: (percentage: number) => void;
  onAssociateGuest: (discountPercentage: number) => void;
}

export const NonAssociatedGuestActions = ({
  selectedGuest,
  onApplyDiscount,
  onAssociateGuest
}: NonAssociatedGuestActionsProps) => {
  const [tempDiscountPercentage, setTempDiscountPercentage] = useState(0);
  const [associationDiscountPercentage, setAssociationDiscountPercentage] = useState(10);

  // Only show if guest is selected and NOT associated
  if (!selectedGuest || selectedGuest.is_associated) {
    return null;
  }

  const discountOptions = [
    { value: '0', label: 'Sin descuento (0%)' },
    { value: '5', label: '5% de descuento' },
    { value: '10', label: '10% de descuento' },
    { value: '15', label: '15% de descuento' },
    { value: '20', label: '20% de descuento' },
    { value: '25', label: '25% de descuento' },
    { value: '30', label: '30% de descuento' },
  ];

  const associationDiscountOptions = [
    { value: '5', label: '5% de descuento' },
    { value: '10', label: '10% de descuento' },
    { value: '15', label: '15% de descuento' },
    { value: '20', label: '20% de descuento' },
    { value: '25', label: '25% de descuento' },
    { value: '30', label: '30% de descuento' },
  ];

  const handleApplyTempDiscount = () => {
    console.log('Applying temporary discount:', tempDiscountPercentage);
    onApplyDiscount(tempDiscountPercentage);
  };

  const handleAssociateGuest = () => {
    console.log('Associating guest with discount:', associationDiscountPercentage);
    onAssociateGuest(associationDiscountPercentage);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <UserPlus className="h-5 w-5" />
          Opciones para Huésped No Asociado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium">
              {selectedGuest.first_name} {selectedGuest.last_name} no está asociado
            </p>
            <p className="text-blue-700 mt-1">
              Puedes aplicar un descuento temporal para esta reserva o asociar permanentemente al huésped.
            </p>
          </div>
        </div>

        {/* Descuento temporal solo para esta reserva */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Descuento Temporal (Solo esta reserva)
          </h4>
          
          <div className="space-y-2">
            <Label className="text-sm">Porcentaje de descuento</Label>
            <Select
              value={tempDiscountPercentage.toString()}
              onValueChange={(value) => setTempDiscountPercentage(parseInt(value))}
            >
              <SelectTrigger>
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
          </div>

          <Button 
            onClick={handleApplyTempDiscount}
            variant="outline" 
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Aplicar Descuento Temporal
          </Button>
        </div>

        {/* Asociar huésped permanentemente */}
        <div className="space-y-3 p-4 border border-green-200 rounded-lg bg-green-50">
          <h4 className="font-medium flex items-center gap-2 text-green-800">
            <UserPlus className="h-4 w-4" />
            Asociar Huésped Permanentemente
          </h4>
          
          <div className="space-y-2">
            <Label className="text-sm">Porcentaje de descuento por defecto</Label>
            <Select
              value={associationDiscountPercentage.toString()}
              onValueChange={(value) => setAssociationDiscountPercentage(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar descuento por defecto" />
              </SelectTrigger>
              <SelectContent>
                {associationDiscountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
            💡 Al asociar, el huésped tendrá este descuento por defecto en futuras reservas
          </div>

          <Button 
            onClick={handleAssociateGuest}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Asociar Huésped
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
