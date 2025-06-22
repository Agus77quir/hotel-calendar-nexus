
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AuditRecord } from '@/types/audit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditRecordDetailsProps {
  record: AuditRecord | null;
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
}

export const AuditRecordDetails = ({ record, isOpen, onClose, entityType }: AuditRecordDetailsProps) => {
  if (!record) return null;

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationText = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return 'Creación';
      case 'UPDATE':
        return 'Actualización';
      case 'DELETE':
        return 'Eliminación';
      default:
        return operation;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Detalles del Registro de Auditoría - {entityType}
            <Badge className={getOperationColor(record.operation_type)}>
              {getOperationText(record.operation_type)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha y Hora</label>
              <p className="text-sm">
                {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Usuario</label>
              <p className="text-sm">{record.changed_by || 'Sistema'}</p>
            </div>
          </div>

          {record.operation_type !== 'INSERT' && record.old_data && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Datos Anteriores</label>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(record.old_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {record.operation_type !== 'DELETE' && record.new_data && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                {record.operation_type === 'INSERT' ? 'Datos Creados' : 'Datos Nuevos'}
              </label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(record.new_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
