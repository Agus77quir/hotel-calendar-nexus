
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Download, Filter } from 'lucide-react';
import { useAuditData } from '@/hooks/useAuditData';
import { BackToHomeButton } from '@/components/ui/back-to-home-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AuditPage = () => {
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const { guestsAudit, roomsAudit, reservationsAudit, isLoading } = useAuditData();

  // Combinar todos los registros de auditoría
  const allAuditRecords = [
    ...guestsAudit.map(record => ({ ...record, type: 'guest' })),
    ...roomsAudit.map(record => ({ ...record, type: 'room' })),
    ...reservationsAudit.map(record => ({ ...record, type: 'reservation' }))
  ].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

  // Filtrar registros
  const filteredRecords = allAuditRecords.filter(record => {
    const responsibleMatch = responsibleFilter === 'all' || record.changed_by === responsibleFilter;
    const dateMatch = !dateFilter || format(new Date(record.changed_at), 'yyyy-MM-dd') === dateFilter;
    return responsibleMatch && dateMatch;
  });

  const getGuestName = (record: any) => {
    try {
      const data = record.new_data || record.old_data;
      if (record.type === 'guest' && data) {
        return data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : 'N/A';
      }
      if (record.type === 'reservation' && data) {
        return data.guest_name || 'N/A';
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getRoomNumber = (record: any) => {
    try {
      const data = record.new_data || record.old_data;
      if (record.type === 'room' && data) {
        return data.number ? `${data.number}` : 'N/A';
      }
      if (record.type === 'reservation' && data) {
        return data.room_number || 'N/A';
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getReservationInfo = (record: any) => {
    try {
      const data = record.new_data || record.old_data;
      if (record.type === 'reservation' && data) {
        const checkIn = data.check_in ? format(new Date(data.check_in), 'dd/MM/yyyy') : '';
        const checkOut = data.check_out ? format(new Date(data.check_out), 'dd/MM/yyyy') : '';
        return checkIn && checkOut ? `${checkIn} - ${checkOut}` : 'N/A';
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text('Reporte de Auditoría', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 35);
    doc.text(`Total de registros: ${filteredRecords.length}`, 20, 45);
    
    const auditData = filteredRecords.map(record => [
      format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      record.changed_by || 'Sistema',
      getGuestName(record),
      getRoomNumber(record),
      getReservationInfo(record)
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Fecha y Hora', 'Responsable', 'Huésped', 'Habitación', 'Reserva']],
      body: auditData,
      theme: 'striped',
      headStyles: { 
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 50 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    doc.save(`auditoria-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

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
            Registro completo de todos los movimientos del sistema
          </p>
        </div>
        <BackToHomeButton />
      </div>

      {/* Filtros */}
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
              <Label htmlFor="responsible">Responsable</Label>
              <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los responsables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Rec1">Rec1</SelectItem>
                  <SelectItem value="Rec2">Rec2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={exportToPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de auditoría con scroll horizontal */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="py-3 px-4 text-left font-medium">Fecha y Hora</th>
                    <th className="py-3 px-4 text-left font-medium">Responsable</th>
                    <th className="py-3 px-4 text-left font-medium">Huésped</th>
                    <th className="py-3 px-4 text-left font-medium">Habitación</th>
                    <th className="py-3 px-4 text-left font-medium">Reserva</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No se encontraron registros de auditoría
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </td>
                        <td className="py-3 px-4">{record.changed_by || 'Sistema'}</td>
                        <td className="py-3 px-4">{getGuestName(record)}</td>
                        <td className="py-3 px-4">{getRoomNumber(record)}</td>
                        <td className="py-3 px-4">{getReservationInfo(record)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPage;
