
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditRecordWithEntity } from '@/types/audit';
import { getOperationText, getOperationColor, getEntityName, getEntityDetails } from '@/utils/historyHelpers';

interface HistoryTableProps {
  records: AuditRecordWithEntity[];
  filteredRecords: AuditRecordWithEntity[];
}

export const HistoryTable = ({ records, filteredRecords }: HistoryTableProps) => {
  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Acciones (0 registros)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay registros de auditoría</h3>
            <p className="text-muted-foreground">
              Los registros de acciones aparecerán aquí cuando se realicen operaciones en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Historial de Acciones ({filteredRecords.length} registros)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Habitación</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No se encontraron registros con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const details = getEntityDetails(record);
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {record.changed_by || 'Sistema'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getOperationColor(record.operation_type)}>
                          {getOperationText(record.operation_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getEntityName(record)}</TableCell>
                      <TableCell>{details.room}</TableCell>
                      <TableCell>{details.checkIn}</TableCell>
                      <TableCell>{details.checkOut}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
