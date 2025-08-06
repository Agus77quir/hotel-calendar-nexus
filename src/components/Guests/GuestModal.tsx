
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('GuestModal useEffect triggered - mode:', mode, 'isOpen:', isOpen, 'guest:', guest);
    
    if (guest && mode === 'edit') {
      console.log('Setting form data from guest:', guest);
      setFormData({
        first_name: guest.first_name || '',
        last_name: guest.last_name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        document: guest.document || '',
        nationality: guest.nationality || '',
      });
      console.log('Form data set to:', {
        first_name: guest.first_name || '',
        last_name: guest.last_name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        document: guest.document || '',
        nationality: guest.nationality || '',
      });
    } else {
      console.log('Resetting form data for new guest');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        document: '',
        nationality: '',
      });
    }
    setEmailError('');
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

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      console.error('Validation error: Nombre requerido');
      return false;
    }
    if (!formData.last_name.trim()) {
      console.error('Validation error: Apellido requerido');
      return false;
    }
    if (!formData.email.trim()) {
      console.error('Validation error: Email requerido');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setEmailError('Por favor ingrese un email válido');
      console.error('Validation error: Email inválido');
      return false;
    }
    if (!formData.phone.trim()) {
      console.error('Validation error: Teléfono requerido');
      return false;
    }
    if (!formData.document.trim()) {
      console.error('Validation error: Documento requerido');
      return false;
    }
    if (!formData.nationality.trim()) {
      console.error('Validation error: Nacionalidad requerida');
      return false;
    }
    console.log('Form validation passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting guest creation/update process with form data:', formData);
    
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const guestPayload = {
        ...formData,
        is_associated: false,
        discount_percentage: 0
      };
      
      console.log('Attempting to save guest with data:', guestPayload);
      await onSave(guestPayload);
      console.log('Guest saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving guest:', error);
      // Let the parent component handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  console.log('GuestModal render - isOpen:', isOpen, 'formData:', formData);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Huésped' : 'Editar Huésped'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              disabled={isSubmitting}
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="document">Documento *</Label>
            <Input
              id="document"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidad *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!!emailError || isSubmitting}
            >
              {isSubmitting 
                ? 'Guardando...' 
                : mode === 'create' 
                  ? 'Crear Huésped' 
                  : 'Actualizar Huésped'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
