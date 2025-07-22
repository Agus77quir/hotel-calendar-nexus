
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Percent, DollarSign } from 'lucide-react';
import { Guest } from '@/types/hotel';

interface DiscountSectionProps {
  selectedGuest: Guest | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  setDiscountValue: (value: number) => void;
}

export const DiscountSection = ({
  selectedGuest,
  discountType,
  discountValue,
  setDiscountType,
  setDiscountValue,
}: DiscountSectionProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Descuentos y Promociones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de descuento */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo de Descuento</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={discountType === 'percentage'}
                onCheckedChange={(checked) => setDiscountType(checked ? 'percentage' : 'fixed')}
              />
              <Label className="text-sm">Porcentaje</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={discountType === 'fixed'}
                onCheckedChange={(checked) => setDiscountType(checked ? 'fixed' : 'percentage')}
              />
              <Label className="text-sm">Monto Fijo</Label>
            </div>
          </div>
        </div>

        {/* Valor del descuento */}
        <div className="space-y-2">
          <Label htmlFor="discount-value" className="text-sm font-medium">
            Valor del Descuento
          </Label>
          <div className="relative">
            {discountType === 'percentage' ? (
              <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            ) : (
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            )}
            <Input
              id="discount-value"
              type="number"
              min="0"
              max={discountType === 'percentage' ? "100" : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="pl-10"
              placeholder={discountType === 'percentage' ? "0-100" : "0.00"}
            />
          </div>
        </div>

        {/* Vista previa del descuento */}
        {discountValue > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Descuento aplicado: {discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
