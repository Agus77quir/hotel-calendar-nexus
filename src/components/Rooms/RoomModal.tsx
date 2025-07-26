import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Room } from '@/types/hotel';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: any) => void;
  room?: Room;
  mode: 'create' | 'edit';
}

export const RoomModal = ({
  isOpen,
  onClose,
  onSave,
  room,
  mode
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
    });
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
      <DialogContent className="max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Habitación' : 'Editar Habitación'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="number">Número de Habitación</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: Room['type']) => setFormData({...formData, type: value})}>
              <SelectTrigger>
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
            <div>
              <Label htmlFor="price">Precio por noche</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: Room['status']) => setFormData({...formData, status: value})}>
              <SelectTrigger>
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
            <Label htmlFor="amenities">Comodidades</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Agregar comodidad..."
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Crear Habitación' : 'Actualizar Habitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
