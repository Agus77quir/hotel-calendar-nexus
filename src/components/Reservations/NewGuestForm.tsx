
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, X } from 'lucide-react';
import { useIsIOS } from '@/hooks/use-mobile';

interface NewGuestFormProps {
  onSave: (guestData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const NewGuestForm = ({ onSave, onCancel, isSubmitting = false }: NewGuestFormProps) => {
  const isIOS = useIsIOS();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document: '',
    nationality: 'No especificado',
    is_associated: false,
    discount_percentage: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nombre es requerido';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono es requerido';
    }
    if (!formData.document.trim()) {
      newErrors.document = 'Documento es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base sm:text-lg">Nuevo Huésped</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="first_name" className="text-sm">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={isSubmitting}
                  className={`${errors.first_name ? 'border-red-500' : ''} h-11 sm:h-10 text-base touch-manipulation`}
                  style={{ fontSize: '16px' }}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name" className="text-sm">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={isSubmitting}
                  className={`${errors.last_name ? 'border-red-500' : ''} h-11 sm:h-10 text-base touch-manipulation`}
                  style={{ fontSize: '16px' }}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                className={`${errors.email ? 'border-red-500' : ''} h-11 sm:h-10 text-base touch-manipulation`}
                style={{ fontSize: '16px' }}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isSubmitting}
                className={`${errors.phone ? 'border-red-500' : ''} h-11 sm:h-10 text-base touch-manipulation`}
                style={{ fontSize: '16px' }}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="document" className="text-sm">Documento *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                disabled={isSubmitting}
                className={`${errors.document ? 'border-red-500' : ''} h-11 sm:h-10 text-base touch-manipulation`}
                style={{ fontSize: '16px' }}
              />
              {errors.document && (
                <p className="text-red-500 text-xs mt-1">{errors.document}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Botones fijos en la parte inferior para móviles */}
      <div className="w-full bg-white border-t border-gray-200 p-4 mt-4 sticky bottom-0 z-50 shadow-lg rounded-t-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end max-w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 sm:h-11 px-6 touch-manipulation text-base sm:text-sm font-medium order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 sm:h-11 px-6 touch-manipulation text-base sm:text-sm font-medium bg-primary hover:bg-primary/90 order-1 sm:order-2"
          >
            {isSubmitting ? 'Guardando...' : 'Crear Huésped'}
          </Button>
        </div>
      </div>
    </div>
  );
};
