
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

    const getEntityName = (record: AuditRecordWithEntity) => {
      try {
        const data = record.new_data || record.old_data;
        if (!data || typeof data !== 'object') return 'N/A';

        if (record.entityType === 'guests') {
          if (data.first_name && data.last_name) {
            return `${data.first_name} ${data.last_name}`;
          }
        } else if (record.entityType === 'reservations') {
          if (data.guest_name) {
            return data.guest_name;
          }
        } else if (record.entityType === 'rooms') {
          if (data.number) {
            return `Habitación ${data.number}`;
          }
        }
        return 'N/A';
      } catch (error) {
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
        return { room: 'N/A', checkIn: 'N/A', checkOut: 'N/A' };
      }
    };
    
    // Preparar datos para la tabla
    const historyData = records.map(record => {
      const details = getEntityDetails(record);
      return [
        format(new Date(record.changed_at), 'dd/MM/yyyy HH:mm', { locale: es }),
        record.changed_by || 'Sistema',
        getOperationText(record.operation_type),
        getEntityName(record),
        details.room,
        details.checkIn,
        details.checkOut
      ];
    });
    
    // Crear la tabla
    autoTable(doc, {
      startY: 60,
      head: [['Fecha', 'Usuario', 'Acción', 'Entidad', 'Habitación', 'Check-in', 'Check-out']],
      body: historyData,
      theme: 'striped',
      headStyles: { 
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Fecha
        1: { cellWidth: 20 }, // Usuario
        2: { cellWidth: 20 }, // Acción
        3: { cellWidth: 35 }, // Entidad
        4: { cellWidth: 20 }, // Habitación
        5: { cellWidth: 20 }, // Check-in
        6: { cellWidth: 20 }  // Check-out
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
