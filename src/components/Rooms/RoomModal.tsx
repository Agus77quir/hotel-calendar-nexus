import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useHotelDataWithContext } from '@/hooks/useHotelDataWithContext';
import { Room } from '@/types/hotel';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room;
}

export const RoomModal = ({ isOpen, onClose, room }: RoomModalProps) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'single',
    capacity: 1,
    price: 0,
    status: 'available',
    amenities: [],
  });

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number,
        type: room.type,
        capacity: room.capacity,
        price: room.price,
        status: room.status,
        amenities: room.amenities,
      });
    } else {
      // Reset form when creating a new room
      setFormData({
        number: '',
        type: 'single',
        capacity: 1,
        price: 0,
        status: 'available',
        amenities: [],
      });
    }
  }, [room]);
  
  const { createRoom, updateRoom } = useHotelDataWithContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prevData => {
      let newAmenities = [...prevData.amenities];
      if (checked) {
        newAmenities.push(value);
      } else {
        newAmenities = newAmenities.filter(amenity => amenity !== value);
      }
      return {
        ...prevData,
        amenities: newAmenities,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const roomData = {
        number: formData.number,
        type: formData.type,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        status: formData.status,
        amenities: formData.amenities,
      };

      if (room) {
        await updateRoom(room.id, roomData);
        toast({
          title: "Habitación actualizada",
          description: "La información de la habitación ha sido actualizada exitosamente",
        });
      } else {
        await createRoom(roomData);
        toast({
          title: "Habitación creada",
          description: "La habitación ha sido creada exitosamente",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la habitación",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Habitación' : 'Nueva Habitación'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Número de Habitación</Label>
              <Input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo de Habitación</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prevData => ({ ...prevData, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Individual</SelectItem>
                  <SelectItem value="double">Doble</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="price">Precio por Noche</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prevData => ({ ...prevData, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Servicios</Label>
            <div className="flex flex-wrap gap-2">
              <div className="space-x-2">
                <Checkbox
                  id="wifi"
                  value="wifi"
                  checked={formData.amenities.includes('wifi')}
                  onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'wifi', checked } } as any)}
                />
                <Label htmlFor="wifi">WiFi</Label>
              </div>
              <div className="space-x-2">
                <Checkbox
                  id="tv"
                  value="tv"
                  checked={formData.amenities.includes('tv')}
                  onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'tv', checked } } as any)}
                />
                <Label htmlFor="tv">TV</Label>
              </div>
              <div className="space-x-2">
                <Checkbox
                  id="ac"
                  value="ac"
                  checked={formData.amenities.includes('ac')}
                  onCheckedChange={(checked) => handleCheckboxChange({ target: { value: 'ac', checked } } as any)}
                />
                <Label htmlFor="ac">Aire Acondicionado</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {room ? 'Guardar Cambios' : 'Crear Habitación'}
            </Button>
          </div>
        </form>
        <Button
          variant="ghost"
          className="absolute right-4 top-4 md:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Cerrar</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
