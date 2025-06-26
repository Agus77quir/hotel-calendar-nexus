
import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { AuditRecordWithEntity } from '@/types/audit';
import { useHistoryExport } from '@/hooks/useHistoryExport';
import { toast } from '@/hooks/use-toast';
import { HistoryFilters } from '@/components/History/HistoryFilters';
import { HistoryTable } from '@/components/History/HistoryTable';
import { HistoryLoadingState } from '@/components/History/HistoryLoadingState';
import { HistoryErrorState } from '@/components/History/HistoryErrorState';
import { filterRecords } from '@/utils/historyHelpers';

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperation, setFilterOperation] = useState<'all' | 'INSERT' | 'UPDATE' | 'DELETE'>('all');
  const [filterUser, setFilterUser] = useState<'all' | 'Admin' | 'Rec 1' | 'Rec 2'>('all');
  const [dateFilter, setDateFilter] = useState('');
  
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
  const filteredRecords = filterRecords(allRecords, searchTerm, filterOperation, filterUser, dateFilter);

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
    return <HistoryLoadingState />;
  }

  if (error) {
    return <HistoryErrorState />;
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

      <HistoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOperation={filterOperation}
        setFilterOperation={setFilterOperation}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onClearFilters={clearFilters}
        onExportPDF={handleExportPDF}
      />

      <HistoryTable records={allRecords} filteredRecords={filteredRecords} />
    </div>
  );
};

export default HistoryPage;
