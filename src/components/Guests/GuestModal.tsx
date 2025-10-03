import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Guest } from '@/types/hotel';
import { GuestForm, GuestFormValues } from './GuestForm';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: GuestFormValues = mode === 'edit' && guest ? {
    first_name: guest.first_name || '',
    last_name: guest.last_name || '',
    email: guest.email || '',
    phone: guest.phone || '',
    document: guest.document || '',
    nationality: guest.nationality || '',
  } : {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document: '',
    nationality: '',
  };

  const handleSubmit = async (values: GuestFormValues) => {
    setIsSubmitting(true);
    try {
      const guestPayload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email?.trim() || undefined,
        phone: values.phone.trim(),
        document: values.document.trim(),
        nationality: values.nationality?.trim() || undefined,
        is_associated: guest?.is_associated ?? false,
        discount_percentage: guest?.discount_percentage ?? 0,
      };

      await onSave(guestPayload);
      onClose();
    } catch (error) {
      console.error('Error saving guest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Huésped' : 'Editar Huésped'}
          </DialogTitle>
        </DialogHeader>

        <GuestForm
          defaultValues={initialValues}
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
