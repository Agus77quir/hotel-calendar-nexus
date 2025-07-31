
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { Room } from '@/types/hotel';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: any, updateGroupPrice?: boolean) => void;
  room?: Room;
  mode: 'create' | 'edit';
  rooms?: Room[];
}

export const RoomModal = ({
  isOpen,
  onClose,
  onSave,
  room,
  mode,
  rooms = []
}: RoomModalProps) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'matrimonial' as Room['type'],
    price: '',
    capacity: '',
    status: 'available' as Room['status'],
    amenities: [] as string[],
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [updateGroupPrice, setUpdateGroupPrice] = useState(true);

  useEffect(() => {
    if (room && mode === 'edit') {
      setFormData({
        number: room.number,
        type: room.type,
        price: room.price.toString(),
        capacity: room.capacity.toString(),
        status: room.status,
        amenities: room.amenities || [],
      });
    } else {
      setFormData({
        number: '',
        type: 'matrimonial',
        price: '',
        capacity: '',
        status: 'available',
        amenities: [],
      });
    }
  }, [room, mode, isOpen]);

  // Calculate how many rooms of the same type will be affected by price changes
  const sameTypeRoomsCount = rooms.filter(r => 
    r.type === formData.type && (mode === 'create' || r.id !== room?.id)
  ).length + 1; // +1 for the current room

  const isPriceChanged = mode === 'edit' && room && parseFloat(formData.price) !== room.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
    }, updateGroupPrice);
    onClose();
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAmenity();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 w-full h-full max-w-none max-h-none m-0 p-0 md:w-[95vw] md:max-w-md md:mx-auto md:fixed md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[90vh] md:h-auto md:rounded-lg md:p-6 overflow-y-auto touch-manipulation">
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <DialogHeader className="pb-4 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">
              {mode === 'create' ? 'Nueva Habitación' : 'Editar Habitación'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label htmlFor="number" className="text-sm font-medium">Número de Habitación</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                required
                className="mt-1 iphone-input"
              />
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: Room['type']) => setFormData({...formData, type: value})}>
                <SelectTrigger className="mt-1 iphone-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matrimonial">Matrimonial</SelectItem>
                  <SelectItem value="triple-individual">Triple Individual</SelectItem>
                  <SelectItem value="triple-matrimonial">Triple Matrimonial</SelectItem>
                  <SelectItem value="doble-individual">Doble Individual</SelectItem>
                  <SelectItem value="suite-presidencial-doble">Suite Presidencial Doble</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="price" className="text-sm font-medium">Precio por noche</Label>
                
                {/* Checkbox para precio grupal */}
                {mode === 'edit' && sameTypeRoomsCount > 1 && (
                  <div className="flex items-center space-x-2 mt-2 mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <Checkbox 
                      id="updateGroupPrice" 
                      checked={updateGroupPrice}
                      onCheckedChange={(checked) => setUpdateGroupPrice(checked as boolean)}
                    />
                    <Label htmlFor="updateGroupPrice" className="text-sm font-medium text-blue-800">
                      Actualizar precio para todas las habitaciones tipo "{formData.type}" ({sameTypeRoomsCount} habitaciones)
                    </Label>
                  </div>
                )}

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

                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  className="mt-1 iphone-input col-span-2"
                />
              </div>
              <div>
                <Label htmlFor="capacity" className="text-sm font-medium">Capacidad</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  required
                  className="mt-1 iphone-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
              <Select value={formData.status} onValueChange={(value: Room['status']) => setFormData({...formData, status: value})}>
                <SelectTrigger className="mt-1 iphone-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Ocupada</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="cleaning">Limpieza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amenities" className="text-sm font-medium">Comodidades</Label>
              <div className="flex gap-2 mb-2 mt-1">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar comodidad..."
                  className="flex-1 iphone-input"
                />
                <Button 
                  type="button" 
                  onClick={addAmenity} 
                  variant="outline"
                  className="iphone-button px-3"
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    <span className="text-xs">{amenity}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeAmenity(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="iphone-button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="iphone-button bg-primary hover:bg-primary/90"
              >
                {mode === 'create' ? 'Crear Habitación' : 'Actualizar Habitación'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
