
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Filter, Clock, AlertCircle, Calendar, User } from 'lucide-react';
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
  const [filterUser, setFilterUser] = useState<'all' | 'admin' | 'rec1' | 'rec2'>('all');
  const [dateFilter, setDateFilter] = useState('');
  
  const { auditRecords, isLoading, error } = useAuditData();
  const { exportHistoryToPDF } = useHistoryExport();

  console.log('HistoryPage render state:', {
    auditRecordsLength: auditRecords?.length || 0,
    isLoading,
    hasError: !!error,
    sampleRecords: auditRecords?.slice(0, 2)
  });

  // Filtrar registros
  const filteredRecords = auditRecords.filter(record => {
    const entityName = getEntityName(record);
    const matchesSearch = searchTerm === '' || 
      (record.changed_by && record.changed_by.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = filterOperation === 'all' || record.operation_type === filterOperation;
    const matchesUser = filterUser === 'all' || record.changed_by === filterUser;
    
    const matchesDate = dateFilter === '' || 
      format(new Date(record.changed_at), 'yyyy-MM-dd') === dateFilter;
    
    return matchesSearch && matchesOperation && matchesUser && matchesDate;
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

  const getEntityName = (record: AuditRecordWithEntity) => {
    try {
      const data = record.new_data || record.old_data;
      console.log('Getting entity name for:', record.entityType, data);
      
      if (!data || typeof data !== 'object') return 'N/A';

      if (record.entityType === 'guests') {
        if (data.first_name && data.last_name) {
          return `${data.first_name} ${data.last_name}`;
        }
      } else if (record.entityType === 'reservations') {
        // Try to get guest name from context info first
        if (data.guest_name) {
          return `Reserva - ${data.guest_name}`;
        }
        // Fallback to reservation ID
        const reservationId = data.id || record.reservation_id;
        if (reservationId) {
          // Generate simple sequential ID
          const hexString = reservationId.toString().replace(/-/g, '').substring(0, 8);
          const number = parseInt(hexString, 16);
          const simpleId = (number % 99) + 1;
          return `Reserva ${simpleId.toString().padStart(2, '0')}`;
        }
      } else if (record.entityType === 'rooms') {
        if (data.number) {
          return `Habitación ${data.number}`;
        }
      }
      return `${record.entityType} - N/A`;
    } catch (error) {
      console.error('Error getting entity name:', error);
      return 'N/A';
    }
  };

  const getEntityDetails = (record: AuditRecordWithEntity) => {
    try {
      const data = record.new_data || record.old_data;
      if (!data || typeof data !== 'object') return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };

      if (record.entityType === 'reservations') {
        return {
          room: data.room_number || 'N/A',
          checkIn: data.check_in ? format(new Date(data.check_in), 'dd/MM/yyyy') : 'N/A',
          checkOut: data.check_out ? format(new Date(data.check_out), 'dd/MM/yyyy') : 'N/A'
        };
      } else if (record.entityType === 'rooms') {
        return {
          room: data.number || 'N/A',
          checkIn: 'N/A',
          checkOut: 'N/A'
        };
      }
      return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };
    } catch (error) {
      console.error('Error getting entity details:', error);
      return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterOperation('all');
    setFilterUser('all');
    setDateFilter('');
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
    console.error('Audit page error:', error);
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
                No se pudieron cargar los registros de auditoría: {error?.message || 'Error desconocido'}
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
            Registro de acciones realizadas en el sistema ({auditRecords.length} registros totales)
          </p>
        </div>
        <BackToHomeButton />
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuario o entidad..."
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
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="INSERT">Creación</SelectItem>
                  <SelectItem value="UPDATE">Actualización</SelectItem>
                  <SelectItem value="DELETE">Eliminación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Select value={filterUser} onValueChange={(value: any) => setFilterUser(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="rec1">rec1</SelectItem>
                  <SelectItem value="rec2">rec2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Acciones</label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Limpiar
                </Button>
                <Button onClick={handleExportPDF} className="flex-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historial de Acciones ({filteredRecords.length} registros mostrados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay registros de auditoría</h3>
              <p className="text-muted-foreground">
                Los registros de acciones aparecerán aquí cuando se realicen operaciones en el sistema.
              </p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
