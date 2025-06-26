
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Clock, AlertCircle } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditRecordWithEntity } from '@/types/audit';
import { useHistoryExport } from '@/hooks/useHistoryExport';
import { toast } from '@/hooks/use-toast';

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperation, setFilterOperation] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all');
  
  const { guestsAudit, roomsAudit, reservationsAudit, isLoading, error } = useAuditData();
  const { exportHistoryToPDF } = useHistoryExport();

  console.log('HistoryPage render state:', {
    guestsAuditLength: guestsAudit?.length || 0,
    roomsAuditLength: roomsAudit?.length || 0,
    reservationsAuditLength: reservationsAudit?.length || 0,
    isLoading,
    hasError: !!error
  });

  // Combinar todos los registros de auditoría
  const allRecords: AuditRecordWithEntity[] = [
    ...(Array.isArray(guestsAudit) ? guestsAudit.map(record => ({ ...record, entityType: 'guests' as const })) : []),
    ...(Array.isArray(roomsAudit) ? roomsAudit.map(record => ({ ...record, entityType: 'rooms' as const })) : []),
    ...(Array.isArray(reservationsAudit) ? reservationsAudit.map(record => ({ ...record, entityType: 'reservations' as const })) : [])
  ].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  console.log('Combined records:', allRecords.length);

  // Filtrar registros
  const filteredRecords = allRecords.filter(record => {
    const guestName = getGuestName(record);
    const matchesSearch = searchTerm === '' || 
      (record.changed_by && record.changed_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = filterOperation === 'all' || record.operation_type === filterOperation;
    
    return matchesSearch && matchesOperation;
  });

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

  const getGuestName = (record: AuditRecordWithEntity) => {
    try {
      if (record.entityType === 'guests') {
        const data = record.new_data || record.old_data;
        if (data && typeof data === 'object' && data.first_name && data.last_name) {
          return `${data.first_name} ${data.last_name}`;
        }
      } else if (record.entityType === 'reservations') {
        const data = record.new_data || record.old_data;
        if (data && typeof data === 'object' && data.guest_name) {
          return data.guest_name;
        }
      } else if (record.entityType === 'rooms') {
        const data = record.new_data || record.old_data;
        if (data && typeof data === 'object' && data.number) {
          return `Habitación ${data.number}`;
        }
      }
      return 'N/A';
    } catch (error) {
      console.error('Error getting guest name:', error);
      return 'N/A';
    }
  };

  const handleExportPDF = () => {
    try {
      if (filteredRecords.length === 0) {
        toast({
          title: 'Sin datos',
          description: 'No hay registros para exportar',
          variant: 'destructive'
        });
        return;
      }
      exportHistoryToPDF(filteredRecords);
      toast({
        title: 'Exportación exitosa',
        description: 'El archivo PDF se ha generado correctamente'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el archivo PDF',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8" />
              Historial de Movimientos
            </h1>
            <p className="text-muted-foreground">
              Cargando registros del sistema...
            </p>
          </div>
          <BackToHomeButton />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando historial...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8" />
              Historial de Movimientos
            </h1>
            <p className="text-muted-foreground">
              Error al cargar los registros del sistema
            </p>
          </div>
          <BackToHomeButton />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error de conexión</h3>
              <p className="text-muted-foreground mb-4">
                No se pudieron cargar los registros de auditoría. Verifica la conexión con la base de datos.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Historial de Movimientos
          </h1>
          <p className="text-muted-foreground">
            Registro de acciones realizadas en el sistema ({allRecords.length} registros)
          </p>
        </div>
        <BackToHomeButton />
      </div>

      {/* Debug info card - mostrar solo si no hay datos */}
      {allRecords.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Información de depuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-yellow-700">
              <p>Estados de las consultas:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Huéspedes: {guestsAudit?.length || 0} registros</li>
                <li>Habitaciones: {roomsAudit?.length || 0} registros</li>
                <li>Reservas: {reservationsAudit?.length || 0} registros</li>
                <li>Cargando: {isLoading ? 'Sí' : 'No'}</li>
                <li>Error: {error ? 'Sí' : 'No'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuario o huésped..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acción</label>
              <Select value={filterOperation} onValueChange={(value: any) => setFilterOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="INSERT">Creación</SelectItem>
                  <SelectItem value="UPDATE">Actualización</SelectItem>
                  <SelectItem value="DELETE">Eliminación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exportar</label>
              <Button onClick={handleExportPDF} className="w-full flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historial de Acciones ({filteredRecords.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay registros de auditoría</h3>
              <p className="text-muted-foreground">
                Los registros de acciones aparecerán aquí cuando se realicen operaciones en el sistema.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="py-3 px-4 text-left font-medium">Usuario</th>
                    <th className="py-3 px-4 text-left font-medium">Entidad</th>
                    <th className="py-3 px-4 text-left font-medium">Acción</th>
                    <th className="py-3 px-4 text-left font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        No se encontraron registros con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{record.changed_by || 'Sistema'}</td>
                        <td className="py-3 px-4">{getGuestName(record)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {getOperationText(record.operation_type)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
