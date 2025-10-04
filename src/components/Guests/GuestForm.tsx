import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type GuestFormValues = {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  document: string;
  nationality?: string;
};

const guestSchema = z.object({
  first_name: z.string().trim().nonempty({ message: 'El nombre es requerido' }).max(100),
  last_name: z.string().trim().nonempty({ message: 'El apellido es requerido' }).max(100),
  email: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().email({ message: 'Por favor ingrese un email válido' }).max(255).optional()
  ),
  phone: z
    .string()
    .trim()
    .nonempty({ message: 'El teléfono es requerido' })
    .regex(/^[0-9]+$/, { message: 'Use solo números' })
    .min(6, { message: 'Mínimo 6 dígitos' })
    .max(20, { message: 'Máximo 20 dígitos' }),
  document: z
    .string()
    .trim()
    .nonempty({ message: 'El documento es requerido' })
    .regex(/^[0-9]+$/, { message: 'Use solo números' })
    .min(4, { message: 'Mínimo 4 dígitos' })
    .max(30, { message: 'Máximo 30 dígitos' }),
  nationality: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(100).optional()
  ),
});

interface GuestFormProps {
  defaultValues: GuestFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: GuestFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const GuestForm = ({ defaultValues, mode, onSubmit, onCancel, isSubmitting }: GuestFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues,
    mode: 'onChange',
  });

  const disabled = isSubmitting ?? submitting;

  const handleSubmit = async (values: GuestFormValues) => {
    setSubmitting(true);
    try {
      // Valores ya validados y con email/nationality normalizados
      await onSubmit({
        ...values,
        email: values.email?.trim() || undefined,
        nationality: values.nationality?.trim() || undefined,
      });
      // Limpiar el formulario solo si estamos creando (la vista suele cerrarse)
      if (mode === 'create') {
        form.reset({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          document: '',
          nationality: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Nombre *</Label>
          <Input
            id="first_name"
            {...form.register('first_name')}
            disabled={disabled}
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="last_name">Apellido *</Label>
          <Input
            id="last_name"
            {...form.register('last_name')}
            disabled={disabled}
            className={errors.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email (opcional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="ejemplo@correo.com"
          {...form.register('email')}
          disabled={disabled}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          inputMode="numeric"
          {...form.register('phone')}
          disabled={disabled}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="document">Documento *</Label>
        <Input
          id="document"
          inputMode="numeric"
          {...form.register('document')}
          disabled={disabled}
          className={errors.document ? 'border-red-500' : ''}
        />
        {errors.document && (
          <p className="text-red-500 text-sm mt-1">{errors.document.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nationality">Nacionalidad (opcional)</Label>
        <Input
          id="nationality"
          placeholder="Ej: Mexicana"
          {...form.register('nationality')}
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          Cancelar
        </Button>
        <Button type="submit" disabled={disabled}>
          {disabled ? 'Guardando...' : mode === 'create' ? 'Crear Huésped' : 'Actualizar Huésped'}
        </Button>
      </div>
    </form>
  );
};