
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { User, X, UserCheck } from 'lucide-react';
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
    nationality: '',
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
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nacionalidad es requerida';
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
        discount_percentage: formData.is_associated ? formData.discount_percentage : 0
      };
      
      console.log('Attempting to create guest with data:', guestPayload);
      await onSave(guestPayload);
      console.log('Guest created successfully from NewGuestForm');
    } catch (error) {
      console.error('Error creating guest from NewGuestForm:', error);
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAssociatedChange = (checked: boolean) => {
    console.log('Checkbox checked:', checked);
    setFormData(prev => ({
      ...prev,
      is_associated: checked,
      discount_percentage: checked ? 10 : 0 // Default 10% discount for associated guests
    }));
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

          <div>
            <Label htmlFor="nationality">Nacionalidad *</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              disabled={isSubmitting}
              className={`${errors.nationality ? 'border-red-500' : ''} ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
              style={isIOS ? {
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              } : {}}
            />
            {errors.nationality && (
              <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
            )}
          </div>

          {/* Guest Association Section */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center space-x-3 mb-3">
              <Checkbox
                id="is_associated"
                checked={formData.is_associated}
                onCheckedChange={(checked) => handleAssociatedChange(checked === true)}
                disabled={isSubmitting}
                className={`h-5 w-5 ${isIOS ? 'min-h-[44px] min-w-[44px] touch-manipulation' : ''}`}
                style={isIOS ? {
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                } : {}}
              />
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <Label htmlFor="is_associated" className="text-sm font-medium cursor-pointer">
                  Huésped Asociado
                </Label>
              </div>
            </div>
            
            {formData.is_associated && (
              <div className="ml-8 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Label htmlFor="discount_percentage" className="text-sm font-medium">
                  Porcentaje de Descuento (%)
                </Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', Number(e.target.value))}
                  disabled={isSubmitting}
                  className={`w-24 mt-1 ${isIOS ? 'min-h-[44px] touch-manipulation' : ''}`}
                  style={isIOS ? {
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation'
                  } : {}}
                />
                <p className="text-xs text-green-600 mt-1">
                  Los huéspedes asociados reciben descuentos especiales
                </p>
              </div>
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
