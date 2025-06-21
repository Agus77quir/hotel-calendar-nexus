
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Guest } from '@/types/hotel';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: any) => void;
  guest?: Guest;
  mode: 'create' | 'edit';
}

export const GuestModal = ({
  isOpen,
  onClose,
  onSave,
  guest,
  mode
}: GuestModalProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document: '',
    nationality: '',
  });

  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (guest && mode === 'edit') {
      setFormData({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        document: guest.document,
        nationality: guest.nationality,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        document: '',
        nationality: '',
      });
    }
  }, [guest, mode, isOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({...formData, email});
    
    if (email && !validateEmail(email)) {
      setEmailError('Por favor ingrese un email válido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!validateEmail(formData.email)) {
      setEmailError('Por favor ingrese un email válido');
      return;
    }
    
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {mode === 'create' ? 'Nuevo Huésped' : 'Editar Huésped'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm">Nombre</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm">Apellido</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              className={`h-10 ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document" className="text-sm">Documento</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-sm">Nacionalidad</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              required
              className="h-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={!!emailError} className="w-full sm:w-auto">
              {mode === 'create' ? 'Crear Huésped' : 'Actualizar Huésped'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
