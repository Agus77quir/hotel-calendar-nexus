
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useHotelDataWithContext } from '@/hooks/useHotelDataWithContext';
import { Guest } from '@/types/hotel';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: Guest;
}

export const GuestModal = ({ isOpen, onClose, guest }: GuestModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    nationality: '',
    isAssociated: false,
    discountPercentage: 0,
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.first_name,
        lastName: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        document: guest.document,
        nationality: guest.nationality,
        isAssociated: guest.is_associated || false,
        discountPercentage: guest.discount_percentage || 0,
      });
    } else {
      // Reset form when creating a new guest
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        document: '',
        nationality: '',
        isAssociated: false,
        discountPercentage: 0,
      });
    }
  }, [guest]);
  
  const { createGuest, updateGuest } = useHotelDataWithContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prevData => ({
      ...prevData,
      isAssociated: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const guestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        nationality: formData.nationality,
        is_associated: formData.isAssociated,
        discount_percentage: formData.discountPercentage,
      };

      if (guest) {
        await updateGuest(guest.id, guestData);
        toast({
          title: "Huésped actualizado",
          description: "La información del huésped ha sido actualizada exitosamente",
        });
      } else {
        await createGuest(guestData);
        toast({
          title: "Huésped creado",
          description: "El huésped ha sido creado exitosamente",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el huésped",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest ? 'Editar Huésped' : 'Crear Nuevo Huésped'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input 
                type="text" 
                id="firstName" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input 
                type="text" 
                id="lastName" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                type="tel" 
                id="phone" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="document">Documento</Label>
            <Input 
              type="text" 
              id="document" 
              name="document"
              value={formData.document}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidad</Label>
            <Input 
              type="text" 
              id="nationality" 
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="isAssociated">Asociado</Label>
            <Switch
              id="isAssociated"
              checked={formData.isAssociated}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {guest ? 'Guardar Cambios' : 'Crear Huésped'}
            </Button>
          </div>
        </form>
        <Button
          variant="ghost"
          className="absolute right-4 top-4 md:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
