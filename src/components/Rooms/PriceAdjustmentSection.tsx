
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Users, User } from 'lucide-react';
import { Room } from '@/types/hotel';

interface PriceAdjustmentSectionProps {
  formData: {
    price: string;
    single_occupancy_price: string;
    type: Room['type'];
  };
  rooms: Room[];
  updateGroupPrice: boolean;
  onPriceChange: (newPrice: string) => void;
  onSingleOccupancyPriceChange: (newPrice: string) => void;
  onUpdateGroupPriceChange: (checked: boolean) => void;
  mode: 'create' | 'edit';
  room?: Room;
}

export const PriceAdjustmentSection = ({
  formData,
  rooms,
  updateGroupPrice,
  onPriceChange,
  onSingleOccupancyPriceChange,
  onUpdateGroupPriceChange,
  mode,
  room
}: PriceAdjustmentSectionProps) => {
  const [adjustmentType, setAdjustmentType] = useState<'amount' | 'percentage'>('amount');
  const [percentageValue, setPercentageValue] = useState('');

  const sameTypeRoomsCount = rooms.filter(r => 
    r.type === formData.type && (mode === 'create' || r.id !== room?.id)
  ).length + 1;

  const isPriceChanged = mode === 'edit' && room && parseFloat(formData.price) !== room.price;

  const applyPercentageAdjustment = () => {
    const currentPrice = parseFloat(formData.price) || 0;
    const percentage = parseFloat(percentageValue) || 0;
    
    if (percentage === 0 || currentPrice === 0) return;

    const newPrice = currentPrice * (1 + percentage / 100);
    const finalPrice = Math.max(0, newPrice);
    
    onPriceChange(finalPrice.toFixed(2));

    // También aplicar al precio de ocupación individual si existe
    if (formData.single_occupancy_price) {
      const currentSinglePrice = parseFloat(formData.single_occupancy_price) || 0;
      const newSinglePrice = currentSinglePrice * (1 + percentage / 100);
      const finalSinglePrice = Math.max(0, newSinglePrice);
      onSingleOccupancyPriceChange(finalSinglePrice.toFixed(2));
    }
    
    setPercentageValue('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Tipo de Ajuste de Precio</Label>
        <Select value={adjustmentType} onValueChange={(value: 'amount' | 'percentage') => setAdjustmentType(value)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amount">Monto Directo</SelectItem>
            <SelectItem value="percentage">Porcentaje</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {adjustmentType === 'amount' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Precio por noche (ocupación múltiple)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onPriceChange(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="single_price" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Precio por noche (un solo huésped)
            </Label>
            <Input
              id="single_price"
              type="number"
              step="0.01"
              value={formData.single_occupancy_price}
              onChange={(e) => onSingleOccupancyPriceChange(e.target.value)}
              placeholder="Opcional - dejar vacío para usar precio normal"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si se deja vacío, se usará el precio normal para un huésped
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Precio Base (ocupación múltiple)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onPriceChange(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="single_price" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Precio Base (un solo huésped)
            </Label>
            <Input
              id="single_price"
              type="number"
              step="0.01"
              value={formData.single_occupancy_price}
              onChange={(e) => onSingleOccupancyPriceChange(e.target.value)}
              placeholder="Opcional"
              className="mt-1"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-800">Ajuste por Porcentaje</Label>
            </div>
            
            <div className="mb-3">
              <Label className="text-xs text-blue-700">Porcentaje de Aumento (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={percentageValue}
                onChange={(e) => setPercentageValue(e.target.value)}
                placeholder=""
                className="mt-1 h-9"
              />
            </div>

            <Button 
              type="button"
              onClick={applyPercentageAdjustment}
              disabled={!percentageValue || parseFloat(percentageValue) === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
            >
              Aplicar Aumento del {percentageValue}% a ambos precios
            </Button>

            {percentageValue && parseFloat(percentageValue) > 0 && formData.price && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  Precio múltiple resultante: <span className="font-semibold text-blue-800">
                    ${(parseFloat(formData.price) * (1 + parseFloat(percentageValue) / 100)).toFixed(2)}
                  </span>
                </p>
                {formData.single_occupancy_price && (
                  <p className="text-xs text-gray-600">
                    Precio individual resultante: <span className="font-semibold text-blue-800">
                      ${(parseFloat(formData.single_occupancy_price) * (1 + parseFloat(percentageValue) / 100)).toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group price update checkbox */}
      {mode === 'edit' && sameTypeRoomsCount > 1 && (
        <div className="flex items-center space-x-2 mt-2 mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <Checkbox 
            id="updateGroupPrice" 
            checked={updateGroupPrice}
            onCheckedChange={(checked) => onUpdateGroupPriceChange(checked as boolean)}
          />
          <Label htmlFor="updateGroupPrice" className="text-sm font-medium text-blue-800">
            Actualizar precios para todas las habitaciones tipo "{formData.type}" ({sameTypeRoomsCount} habitaciones)
          </Label>
        </div>
      )}

      {/* Status messages */}
      {mode === 'edit' && sameTypeRoomsCount > 1 && updateGroupPrice && (
        <p className="text-xs text-orange-600 mt-1 mb-2 p-2 bg-orange-50 rounded-md border border-orange-200">
          ⚠️ Estos precios se aplicarán a todas las {sameTypeRoomsCount} habitaciones tipo "{formData.type}"
        </p>
      )}

      {mode === 'edit' && sameTypeRoomsCount > 1 && !updateGroupPrice && (
        <p className="text-xs text-green-600 mt-1 mb-2 p-2 bg-green-50 rounded-md border border-green-200">
          ✓ Los precios se aplicarán solo a esta habitación
        </p>
      )}

      {isPriceChanged && updateGroupPrice && (
        <p className="text-xs text-blue-600 mt-1 mb-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          💡 Los precios cambiarán para todas las habitaciones de este tipo
        </p>
      )}
    </div>
  );
};
