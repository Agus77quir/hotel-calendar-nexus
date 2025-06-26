
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuditRecordWithEntity } from '@/types/audit';

export const useHistoryExport = () => {
  const exportHistoryToPDF = useCallback((records: AuditRecordWithEntity[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título del reporte
    doc.setFontSize(20);
    doc.text('Historial de Movimientos', pageWidth / 2, 20, { align: 'center' });
    
    // Fecha del reporte
    doc.setFontSize(12);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 35);
    doc.text(`Total de registros: ${records.length}`, 20, 45);
    
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
    };
    
    // Preparar datos para la tabla
    const historyData = records.map(record => [
      record.changed_by || 'Sistema',
      getGuestName(record),
      getOperationText(record.operation_type),
      format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm', { locale: es })
    ]);
    
    // Crear la tabla
    autoTable(doc, {
      startY: 60,
      head: [['Usuario', 'Huésped', 'Acción', 'Fecha']],
      body: historyData,
      theme: 'striped',
      headStyles: { 
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Usuario
        1: { cellWidth: 50 }, // Huésped
        2: { cellWidth: 35 }, // Acción
        3: { cellWidth: 40 }  // Fecha
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Guardar el PDF
    doc.save(`historial-movimientos-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }, []);
  
  return {
    exportHistoryToPDF
  };
};
