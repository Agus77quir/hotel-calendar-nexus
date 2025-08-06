
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ArrowLeft, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Guest } from '@/types/hotel';
import { useHotelData } from '@/hooks/useHotelData';

interface NewGuestFormProps {
  onSave: (guestData: Omit<Guest, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const NewGuestForm = ({ onSave, onCancel, isSubmitting = false }: NewGuestFormProps) => {
  const { guests } = useHotelData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document: '',
    nationality: 'Colombiano',
    is_associated: false,
    discount_percentage: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    console.log('🔄 NewGuestForm: Input change:', field, '=', value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    console.log('🔄 NewGuestForm: Validating form with data:', formData);
    
    const newErrors: Record<string, string> = {};

    // Campos requeridos
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    
    if (!formData.document?.trim()) {
      newErrors.document = 'El documento es requerido';
    }

    // Validar email solo si se proporciona
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email inválido';
      } else {
        // Verificar email duplicado solo si hay email
        const existingGuest = guests.find(g => 
          g.email && g.email.toLowerCase() === formData.email.toLowerCase()
        );
        if (existingGuest) {
          newErrors.email = 'Ya existe un huésped con este email';
        }
      }
    }

    // Verificar documento duplicado
    const existingGuestByDoc = guests.find(g => g.document === formData.document.trim());
    if (existingGuestByDoc && formData.document.trim()) {
      newErrors.document = 'Ya existe un huésped con este documento';
    }

    console.log('🔍 NewGuestForm: Validation errors:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ NewGuestForm: Form is valid:', isValid);
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 NewGuestForm: Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('❌ NewGuestForm: Validation failed, not submitting');
      return;
    }

    try {
      // Preparar datos para envío - email vacío se convierte en null
      const guestData = {
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || `guest_${Date.now()}@temp.com`, // Email temporal único
        phone: formData.phone.trim(),
        document: formData.document.trim(),
        nationality: formData.nationality,
        is_associated: formData.is_associated,
        discount_percentage: formData.discount_percentage
      };

      console.log('📤 NewGuestForm: Calling onSave with processed data:', guestData);
      await onSave(guestData);
      
      console.log('✅ NewGuestForm: Guest created successfully');
    } catch (error: any) {
      console.error('💥 NewGuestForm: Error in handleSubmit:', error);
      
      // Manejar error de email duplicado específicamente
      if (error.message && error.message.includes('email')) {
        setErrors({ email: 'Ya existe un huésped con este email' });
        toast({
          title: "Error",
          description: "Ya existe un huésped con este email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear el huésped. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Nuevo Huésped</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Completa la información del huésped
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                Nombre *
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Ingresa el nombre"
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Apellido *
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Ingresa el apellido"
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ingresa el teléfono"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">
                Documento *
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder="Número de documento"
                className={errors.document ? 'border-red-500' : ''}
              />
              {errors.document && (
                <p className="text-sm text-red-500">{errors.document}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">
              Nacionalidad *
            </Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Nacionalidad"
            />
          </div>

          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="is_associated"
              checked={formData.is_associated}
              onChange={(e) => handleInputChange('is_associated', e.target.checked)}
              className="rounded"
            />
            <div className="flex-1">
              <Label htmlFor="is_associated" className="cursor-pointer">
                Huésped Asociado
              </Label>
              <p className="text-sm text-muted-foreground">
                Aplicar descuentos y beneficios especiales
              </p>
            </div>
            {formData.is_associated && (
              <Badge variant="secondary" className="ml-2">
                <Percent className="h-3 w-3 mr-1" />
                Descuentos
              </Badge>
            )}
          </div>

          {formData.is_associated && (
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">
                Porcentaje de Descuento
              </Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => handleInputChange('discount_percentage', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? 'Creando...' : 'Crear Huésped'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
