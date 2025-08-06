

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
    console.log('🔍 Validating form with data:', formData);
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nombre es requerido';
      console.log('❌ Validation error: first_name is required');
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Apellido es requerido';
      console.log('❌ Validation error: last_name is required');
    }
    // Email is completely optional - NO validation whatsoever
    console.log('✅ Email validation skipped - field is optional');
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono es requerido';
      console.log('❌ Validation error: phone is required');
    }
    if (!formData.document.trim()) {
      newErrors.document = 'Documento es requerido';
      console.log('❌ Validation error: document is required');
    }

    console.log('🔍 Validation result - errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Starting guest creation process from NewGuestForm');
    console.log('📝 Form data before validation:', formData);
    
    if (!validateForm()) {
      console.error('❌ Form validation failed - stopping submission');
      return;
    }
    
    console.log('✅ Form validation passed - proceeding with guest creation');
    
    try {
      const guestPayload = {
        ...formData,
        email: formData.email || '', // Send empty string if no email provided
        is_associated: false,
        discount_percentage: 0
      };
      
      console.log('📦 Guest payload prepared:', guestPayload);
      console.log('🔄 Calling onSave function...');
      
      await onSave(guestPayload);
      
      console.log('✅ Guest created successfully from NewGuestForm');
    } catch (error) {
      console.error('💥 Error creating guest from NewGuestForm:', error);
      console.error('💥 Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Input changed: ${field} = "${value}"`);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      console.log(`🔧 Clearing error for field: ${field}`);
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
        <CardContent className="pb-2">
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
              <Label htmlFor="email" className="text-sm">Email (opcional)</Label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                placeholder="Opcional - puede dejarse en blanco"
                className="h-11 sm:h-10 text-base touch-manipulation"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
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
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
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

      {/* Botones posicionados más alto para iPhone */}
      <div className="w-full bg-white border-t border-gray-200 p-3 sticky bottom-8 z-50 shadow-lg rounded-lg">
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
