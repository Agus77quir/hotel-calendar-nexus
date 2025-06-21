
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wrench, AlertTriangle } from 'lucide-react';
import { Room } from '@/types/hotel';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room;
  onConfirm: (roomId: string) => void;
}

export const MaintenanceModal = ({
  isOpen,
  onClose,
  room,
  onConfirm,
}: MaintenanceModalProps) => {
  if (!room) return null;

  const handleConfirm = () => {
    onConfirm(room.id);
    onClose();
  };

  const canSetMaintenance = room.status !== 'occupied';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-600" />
            Programar Mantenimiento
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres programar mantenimiento para esta habitación?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Habitación {room.number}</h4>
            <p className="text-sm text-muted-foreground">Tipo: {room.type}</p>
            <p className="text-sm text-muted-foreground">Estado actual: {room.status}</p>
          </div>

          {!canSetMaintenance && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">No se puede programar mantenimiento</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                La habitación está ocupada. Debe estar disponible o en limpieza para programar mantenimiento.
              </p>
            </div>
          )}

          {canSetMaintenance && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Wrench className="h-4 w-4" />
                <span className="font-medium">Mantenimiento programado</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                La habitación será marcada como "En mantenimiento" y no estará disponible para reservas.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canSetMaintenance}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Confirmar Mantenimiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
