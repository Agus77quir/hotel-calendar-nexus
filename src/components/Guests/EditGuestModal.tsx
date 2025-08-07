
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditGuestForm } from './EditGuestForm';
import { Guest } from '@/types/hotel';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  onSave: (updatedGuest: Partial<Guest>) => Promise<void>;
}

export const EditGuestModal = ({
  isOpen,
  onClose,
  guest,
  onSave
}: EditGuestModalProps) => {
  const handleSave = async (updatedGuest: Partial<Guest>) => {
    try {
      await onSave(updatedGuest);
      onClose();
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar Huésped: {guest.first_name} {guest.last_name}
          </DialogTitle>
        </DialogHeader>
        <EditGuestForm
          guest={guest}
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
