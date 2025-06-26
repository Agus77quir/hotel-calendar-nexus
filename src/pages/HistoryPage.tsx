
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Clock } from 'lucide-react';
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
  
  const { guestsAudit, roomsAudit, reservationsAudit, isLoading } = useAuditData();
  const { exportHistoryToPDF } = useHistoryExport();

  console.log('HistoryPage render:', {
    guestsAudit: guestsAudit?.length || 0,
    roomsAudit: roomsAudit?.length || 0,
    reservationsAudit: reservationsAudit?.length || 0,
    isLoading
  });

  // Combinar todos los registros de auditoría con manejo seguro de datos
  const allRecords: AuditRecordWithEntity[] = [
    ...(guestsAudit || []).map(record => ({ ...record, entityType: 'guests' as const })),
    ...(roomsAudit || []).map(record => ({ ...record, entityType: 'rooms' as const })),
    ...(reservationsAudit || []).map(record => ({ ...record, entityType: 'reservations' as const }))
  ].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  console.log('All records combined:', allRecords.length);

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
        const newData = record.new_data || record.old_data;
        if (newData && newData.first_name && newData.last_name) {
          return `${newData.first_name} ${newData.last_name}`;
        }
      } else if (record.entityType === 'reservations') {
        const newData = record.new_data || record.old_data;
        if (newData && newData.guest_name) {
          return newData.guest_name;
        }
      }
      return 'N/A';
    } catch (error) {
      console.log('Error getting guest name:', error);
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
      console.log('Error exporting PDF:', error);
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
                    <th className="py-3 px-4 text-left font-medium">Huésped</th>
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
