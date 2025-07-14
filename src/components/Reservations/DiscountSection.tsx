
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Info } from 'lucide-react';
import { Guest } from '@/types/hotel';

interface DiscountSectionProps {
  selectedGuest: Guest | undefined;
  discountPercentage: number;
  onDiscountChange: (percentage: number) => void;
  subtotal: number;
  discount: number;
  total: number;
}

export const DiscountSection = ({
  selectedGuest,
  discountPercentage,
  onDiscountChange,
  subtotal,
  discount,
  total
}: DiscountSectionProps) => {
  const discountOptions = [
    { value: '0', label: 'Sin descuento (0%)' },
    { value: '5', label: '5% de descuento' },
    { value: '10', label: '10% de descuento' },
    { value: '15', label: '15% de descuento' },
    { value: '20', label: '20% de descuento' },
    { value: '25', label: '25% de descuento' },
    { value: '30', label: '30% de descuento' },
  ];

  const handleDiscountChange = (value: string) => {
    const percentage = parseInt(value);
    console.log('DiscountSection - Discount changed to:', percentage);
    onDiscountChange(percentage);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Percent className="h-5 w-5 text-green-600" />
          Descuentos y Total
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guest info */}
        {selectedGuest && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium">
                {selectedGuest.first_name} {selectedGuest.last_name}
                {selectedGuest.is_associated && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Asociado
                  </Badge>
                )}
              </p>
              {selectedGuest.is_associated && selectedGuest.discount_percentage > 0 && (
                <p className="text-blue-700 mt-1">
                  Descuento por defecto: {selectedGuest.discount_percentage}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Discount selector */}
        <div className="space-y-2">
          <Label className="text-sm">Descuento para esta reserva</Label>
          <Select
            value={discountPercentage.toString()}
            onValueChange={handleDiscountChange}
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
          
          {discountPercentage > 0 && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
              💰 Descuento del {discountPercentage}% aplicado
            </div>
          )}
        </div>

        {/* Total calculation */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento ({discountPercentage}%):</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span className={discount > 0 ? 'text-green-600' : ''}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
