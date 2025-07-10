
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, X } from 'lucide-react';

interface NewGuestFormProps {
  onSave: (guestData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const NewGuestForm = ({ onSave, onCancel, isSubmitting = false }: NewGuestFormProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document: '',
    nationality: '',
    address: '',
  });

  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
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
    console.log('Starting guest creation process from NewGuestForm');
    
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
    
    try {
      const guestPayload = {
        ...formData,
        is_associated: false,
        discount_percentage: 0
      };
      
      console.log('Attempting to create guest with data:', guestPayload);
      await onSave(guestPayload);
      console.log('Guest created successfully from NewGuestForm');
    } catch (error) {
      console.error('Error creating guest from NewGuestForm:', error);
      // Let the parent component handle the error display
      throw error;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Nuevo Huésped</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="document">Documento *</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="nationality">Nacionalidad *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!!emailError || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Crear Huésped'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
