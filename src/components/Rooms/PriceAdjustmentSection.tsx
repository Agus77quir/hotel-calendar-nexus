import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { Room } from '@/types/hotel';

interface PriceAdjustmentSectionProps {
  formData: {
    price: string;
    type: Room['type'];
  };
  rooms: Room[];
  updateGroupPrice: boolean;
  onPriceChange: (newPrice: string) => void;
  onUpdateGroupPriceChange: (checked: boolean) => void;
  mode: 'create' | 'edit';
  room?: Room;
}

export const PriceAdjustmentSection = ({
  formData,
  rooms,
  updateGroupPrice,
  onPriceChange,
  onUpdateGroupPriceChange,
  mode,
  room
}: PriceAdjustmentSectionProps) => {
  const [adjustmentType, setAdjustmentType] = useState<'amount' | 'percentage'>('amount');
  const [percentageValue, setPercentageValue] = useState('');
  const [percentageOperation, setPercentageOperation] = useState<'increase' | 'decrease'>('increase');

  const sameTypeRoomsCount = rooms.filter(r => 
    r.type === formData.type && (mode === 'create' || r.id !== room?.id)
  ).length + 1;

  const isPriceChanged = mode === 'edit' && room && parseFloat(formData.price) !== room.price;

  const applyPercentageAdjustment = () => {
    const currentPrice = parseFloat(formData.price) || 0;
    const percentage = parseFloat(percentageValue) || 0;
    
    if (percentage === 0 || currentPrice === 0) return;

    let newPrice: number;
    if (percentageOperation === 'increase') {
      newPrice = currentPrice * (1 + percentage / 100);
    } else {
      newPrice = currentPrice * (1 - percentage / 100);
    }

    // Ensure price doesn't go below 0
    newPrice = Math.max(0, newPrice);
    
    onPriceChange(newPrice.toFixed(2));
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
        <div>
          <Label htmlFor="price" className="text-sm font-medium">Precio por noche</Label>
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
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="price" className="text-sm font-medium">Precio Base</Label>
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

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-blue-800">Ajuste por Porcentaje</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs text-blue-700">Operación</Label>
                <Select value={percentageOperation} onValueChange={(value: 'increase' | 'decrease') => setPercentageOperation(value)}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span>Aumentar</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="decrease">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span>Disminuir</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-blue-700">Porcentaje (%)</Label>
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
            </div>

            <Button 
              type="button"
              onClick={applyPercentageAdjustment}
              disabled={!percentageValue || parseFloat(percentageValue) === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
            >
              Aplicar {percentageOperation === 'increase' ? 'Aumento' : 'Descuento'} del {percentageValue}%
            </Button>

            {percentageValue && parseFloat(percentageValue) > 0 && formData.price && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  Precio resultante: <span className="font-semibold text-blue-800">
                    ${percentageOperation === 'increase' 
                      ? (parseFloat(formData.price) * (1 + parseFloat(percentageValue) / 100)).toFixed(2)
                      : (parseFloat(formData.price) * (1 - parseFloat(percentageValue) / 100)).toFixed(2)
                    }
                  </span>
                </p>
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
            Actualizar precio para todas las habitaciones tipo "{formData.type}" ({sameTypeRoomsCount} habitaciones)
          </Label>
        </div>
      )}

      {/* Status messages */}
      {mode === 'edit' && sameTypeRoomsCount > 1 && updateGroupPrice && (
        <p className="text-xs text-orange-600 mt-1 mb-2 p-2 bg-orange-50 rounded-md border border-orange-200">
          ⚠️ Este precio se aplicará a todas las {sameTypeRoomsCount} habitaciones tipo "{formData.type}"
        </p>
      )}

      {mode === 'edit' && sameTypeRoomsCount > 1 && !updateGroupPrice && (
        <p className="text-xs text-green-600 mt-1 mb-2 p-2 bg-green-50 rounded-md border border-green-200">
          ✓ El precio se aplicará solo a esta habitación
        </p>
      )}

      {isPriceChanged && updateGroupPrice && (
        <p className="text-xs text-blue-600 mt-1 mb-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          💡 El precio cambiará de ${room?.price} a ${formData.price} para todas las habitaciones de este tipo
        </p>
      )}
    </div>
  );
};
