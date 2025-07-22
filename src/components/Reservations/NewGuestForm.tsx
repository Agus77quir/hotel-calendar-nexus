
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
      console.log('Attempting to create guest with data:', formData);
      await onSave(formData);
      console.log('Guest created successfully from NewGuestForm');
    } catch (error) {
      console.error('Error creating guest from NewGuestForm:', error);
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className={isIOS ? "min-h-[44px] min-w-[44px] touch-manipulation" : ""}
            style={isIOS ? {
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            } : {}}
          >
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
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={isSubmitting}
                className={`${errors.first_name ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
                style={isIOS ? {
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                } : {}}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={isSubmitting}
                className={`${errors.last_name ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
                style={isIOS ? {
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                } : {}}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              className={`${errors.email ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={isSubmitting}
              className={`${errors.phone ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="document">Documento *</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => handleInputChange('document', e.target.value)}
              disabled={isSubmitting}
              className={`${errors.document ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            />
            {errors.document && (
              <p className="text-red-500 text-sm mt-1">{errors.document}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className={isIOS ? "min-h-[44px] touch-manipulation px-6" : ""}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={isIOS ? "min-h-[44px] touch-manipulation px-6" : ""}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            >
              {isSubmitting ? 'Guardando...' : 'Crear Huésped'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
