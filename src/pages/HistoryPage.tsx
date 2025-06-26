
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Download, Search, Filter, Clock } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { AuditRecordDetails } from '@/components/Audit/AuditRecordDetails';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditRecord } from '@/types/audit';

const HistoryPage = () => {
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'guests' | 'rooms' | 'reservations'>('all');
  const [filterOperation, setFilterOperation] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all');
  
  const { guestsAudit, roomsAudit, reservationsAudit, isLoading } = useAuditData();

  // Combinar todos los registros de auditoría
  const allRecords = [
    ...guestsAudit.map(record => ({ ...record, entityType: 'guests' as const })),
    ...roomsAudit.map(record => ({ ...record, entityType: 'rooms' as const })),
    ...reservationsAudit.map(record => ({ ...record, entityType: 'reservations' as const }))
  ].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  // Filtrar registros
  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.changed_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.operation_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || record.entityType === filterType;
    const matchesOperation = filterOperation === 'all' || record.operation_type === filterOperation;
    
    return matchesSearch && matchesType && matchesOperation;
  });

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

  const getEntityTypeText = (entityType: string) => {
    switch (entityType) {
      case 'guests':
        return 'Huéspedes';
      case 'rooms':
        return 'Habitaciones';
      case 'reservations':
        return 'Reservas';
      default:
        return entityType;
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'guests':
        return 'bg-purple-100 text-purple-800';
      case 'rooms':
        return 'bg-orange-100 text-orange-800';
      case 'reservations':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Operación', 'Usuario', 'ID Entidad'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss'),
        getEntityTypeText(record.entityType),
        getOperationText(record.operation_type),
        record.changed_by || 'Sistema',
        (record as any)[`${record.entityType.slice(0, -1)}_id`]?.slice(0, 8) || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_movimientos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando historial...</div>
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
            Registro completo de todos los movimientos del sistema ({allRecords.length} registros)
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuario, operación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Entidad</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="guests">Huéspedes</SelectItem>
                  <SelectItem value="rooms">Habitaciones</SelectItem>
                  <SelectItem value="reservations">Reservas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Operación</label>
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
              <label className="text-sm font-medium">Acciones</label>
              <Button onClick={exportToCSV} className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>
            Movimientos Recientes ({filteredRecords.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="py-3 px-4 text-left font-medium">Fecha y Hora</th>
                  <th className="py-3 px-4 text-left font-medium">Tipo</th>
                  <th className="py-3 px-4 text-left font-medium">Operación</th>
                  <th className="py-3 px-4 text-left font-medium">Usuario</th>
                  <th className="py-3 px-4 text-left font-medium">ID Entidad</th>
                  <th className="py-3 px-4 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No se encontraron registros con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getEntityTypeColor(record.entityType)}>
                          {getEntityTypeText(record.entityType)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getOperationColor(record.operation_type)}>
                          {getOperationText(record.operation_type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{record.changed_by || 'Sistema'}</td>
                      <td className="py-3 px-4">
                        {(record as any)[`${record.entityType.slice(0, -1)}_id`]?.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AuditRecordDetails
        record={selectedRecord}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        entityType={selectedRecord ? getEntityTypeText(selectedRecord.entityType) : ''}
      />
    </div>
  );
};

export default HistoryPage;
