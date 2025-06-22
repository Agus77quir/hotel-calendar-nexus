
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Filter } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { AuditRecordDetails } from '@/components/Audit/AuditRecordDetails';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditRecord, AuditType } from '@/types/audit';

const AuditPage = () => {
  const [selectedTab, setSelectedTab] = useState<AuditType>('guests');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { guestsAudit, roomsAudit, reservationsAudit, isLoading } = useAuditData();

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

  const handleViewDetails = (record: AuditRecord) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  const exportToCSV = (data: AuditRecord[], type: string) => {
    const headers = ['Fecha', 'Operación', 'Usuario', 'ID Entidad'];
    const csvContent = [
      headers.join(','),
      ...data.map(record => [
        format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss'),
        getOperationText(record.operation_type),
        record.changed_by || 'Sistema',
        (record as any)[`${type.slice(0, -1)}_id`] || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderAuditTable = (data: AuditRecord[], type: string, entityIdKey: string) => (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b">
            <th className="py-3 px-4 text-left font-medium">Fecha y Hora</th>
            <th className="py-3 px-4 text-left font-medium">Operación</th>
            <th className="py-3 px-4 text-left font-medium">Usuario</th>
            <th className="py-3 px-4 text-left font-medium">ID Entidad</th>
            <th className="py-3 px-4 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                No se encontraron registros de auditoría
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={record.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                </td>
                <td className="py-3 px-4">
                  <Badge className={getOperationColor(record.operation_type)}>
                    {getOperationText(record.operation_type)}
                  </Badge>
                </td>
                <td className="py-3 px-4">{record.changed_by || 'Sistema'}</td>
                <td className="py-3 px-4">
                  {(record as any)[entityIdKey]?.slice(0, 8)}...
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
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando registros de auditoría...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Auditoría</h1>
          <p className="text-muted-foreground">
            Registro completo de todos los movimientos y cambios del sistema
          </p>
        </div>
        <BackToHomeButton />
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as AuditType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guests">Huéspedes ({guestsAudit.length})</TabsTrigger>
          <TabsTrigger value="rooms">Habitaciones ({roomsAudit.length})</TabsTrigger>
          <TabsTrigger value="reservations">Reservas ({reservationsAudit.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="guests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auditoría de Huéspedes</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => exportToCSV(guestsAudit, 'guests')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderAuditTable(guestsAudit, 'guests', 'guest_id')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auditoría de Habitaciones</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => exportToCSV(roomsAudit, 'rooms')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderAuditTable(roomsAudit, 'rooms', 'room_id')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auditoría de Reservas</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => exportToCSV(reservationsAudit, 'reservations')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderAuditTable(reservationsAudit, 'reservations', 'reservation_id')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AuditRecordDetails
        record={selectedRecord}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        entityType={selectedTab === 'guests' ? 'Huéspedes' : selectedTab === 'rooms' ? 'Habitaciones' : 'Reservas'}
      />
    </div>
  );
};

export default AuditPage;
