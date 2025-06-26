
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Reservation, Guest, Room } from '@/types/hotel';

export const useReportExport = () => {
  const exportToPDF = useCallback((
    reservations: Reservation[],
    guests: Guest[],
    rooms: Room[]
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título del reporte
    doc.setFontSize(20);
    doc.text('Reporte del Hotel', pageWidth / 2, 20, { align: 'center' });
    
    // Fecha del reporte
    doc.setFontSize(12);
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 35);
    
    let yPosition = 50;
    
    // Resumen de habitaciones
    doc.setFontSize(16);
    doc.text('Resumen de Habitaciones', 20, yPosition);
    yPosition += 10;
    
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    
    doc.setFontSize(12);
    doc.text(`Total de habitaciones: ${rooms.length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Habitaciones ocupadas: ${occupiedRooms}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Habitaciones disponibles: ${availableRooms}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Habitaciones en mantenimiento: ${maintenanceRooms}`, 20, yPosition);
    yPosition += 15;
    
    // Tabla de reservas
    doc.setFontSize(16);
    doc.text('Reservas Activas', 20, yPosition);
    yPosition += 10;
    
    const reservationData = reservations
      .filter(r => r.status !== 'cancelled')
      .map(reservation => {
        const guest = guests.find(g => g.id === reservation.guest_id);
        const room = rooms.find(r => r.id === reservation.room_id);
        
        return [
          reservation.id.slice(0, 8),
          `${guest?.first_name || ''} ${guest?.last_name || ''}`,
          room?.number || 'N/A',
          format(new Date(reservation.check_in), 'dd/MM/yyyy'),
          format(new Date(reservation.check_out), 'dd/MM/yyyy'),
          reservation.status === 'confirmed' ? 'Confirmada' :
          reservation.status === 'checked-in' ? 'Registrado' :
          reservation.status === 'checked-out' ? 'Check-out' : reservation.status,
          `$${reservation.total_amount}`
        ];
      });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['ID', 'Huésped', 'Habitación', 'Check-in', 'Check-out', 'Estado', 'Total']],
      body: reservationData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      }
    });
    
    // Nueva página para huéspedes si es necesario
    if (doc.internal.pageSize.height - (doc as any).lastAutoTable.finalY < 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Tabla de huéspedes
    doc.setFontSize(16);
    doc.text('Lista de Huéspedes', 20, yPosition);
    yPosition += 10;
    
    const guestData = guests.map(guest => [
      `${guest.first_name} ${guest.last_name}`,
      guest.email,
      guest.phone,
      guest.nationality,
      format(new Date(guest.created_at), 'dd/MM/yyyy')
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Nombre', 'Email', 'Teléfono', 'Nacionalidad', 'Registro']],
      body: guestData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      }
    });
    
    // Guardar el PDF
    doc.save(`reporte-hotel-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }, []);
  
  const exportToExcel = useCallback((
    reservations: Reservation[],
    guests: Guest[],
    rooms: Room[]
  ) => {
    const workbook = XLSX.utils.book_new();
    
    // Hoja de resumen
    const summaryData = [
      ['Reporte del Hotel'],
      [`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
      [''],
      ['Resumen de Habitaciones'],
      ['Total de habitaciones', rooms.length.toString()],
      ['Habitaciones ocupadas', rooms.filter(r => r.status === 'occupied').length.toString()],
      ['Habitaciones disponibles', rooms.filter(r => r.status === 'available').length.toString()],
      ['Habitaciones en mantenimiento', rooms.filter(r => r.status === 'maintenance').length.toString()],
      [''],
      ['Resumen de Reservas'],
      ['Total de reservas', reservations.length.toString()],
      ['Reservas confirmadas', reservations.filter(r => r.status === 'confirmed').length.toString()],
      ['Reservas registradas', reservations.filter(r => r.status === 'checked-in').length.toString()],
      ['Reservas completadas', reservations.filter(r => r.status === 'checked-out').length.toString()],
      ['Reservas canceladas', reservations.filter(r => r.status === 'cancelled').length.toString()]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Hoja de reservas
    const reservationData = [
      ['ID', 'ID Huésped', 'Nombre Huésped', 'Habitación', 'Check-in', 'Check-out', 'Huéspedes', 'Estado', 'Total', 'Solicitudes Especiales']
    ];
    
    reservations.forEach(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const room = rooms.find(r => r.id === reservation.room_id);
      
      reservationData.push([
        reservation.id,
        reservation.guest_id,
        `${guest?.first_name || ''} ${guest?.last_name || ''}`,
        room?.number || 'N/A',
        reservation.check_in,
        reservation.check_out,
        reservation.guests_count.toString(),
        reservation.status === 'confirmed' ? 'Confirmada' :
        reservation.status === 'checked-in' ? 'Registrado' :
        reservation.status === 'checked-out' ? 'Check-out' :
        reservation.status === 'cancelled' ? 'Cancelada' : reservation.status,
        reservation.total_amount.toString(),
        reservation.special_requests || ''
      ]);
    });
    
    const reservationSheet = XLSX.utils.aoa_to_sheet(reservationData);
    XLSX.utils.book_append_sheet(workbook, reservationSheet, 'Reservas');
    
    // Hoja de huéspedes
    const guestData = [
      ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Documento', 'Nacionalidad', 'Fecha Registro']
    ];
    
    guests.forEach(guest => {
      guestData.push([
        guest.id,
        guest.first_name,
        guest.last_name,
        guest.email,
        guest.phone,
        guest.document,
        guest.nationality,
        format(new Date(guest.created_at), 'dd/MM/yyyy')
      ]);
    });
    
    const guestSheet = XLSX.utils.aoa_to_sheet(guestData);
    XLSX.utils.book_append_sheet(workbook, guestSheet, 'Huéspedes');
    
    // Hoja de habitaciones
    const roomData = [
      ['ID', 'Número', 'Tipo', 'Capacidad', 'Precio', 'Estado', 'Amenidades', 'Fecha Creación']
    ];
    
    rooms.forEach(room => {
      roomData.push([
        room.id,
        room.number,
        room.type,
        room.capacity.toString(),
        room.price.toString(),
        room.status === 'available' ? 'Disponible' :
        room.status === 'occupied' ? 'Ocupada' :
        room.status === 'maintenance' ? 'Mantenimiento' : room.status,
        room.amenities?.join(', ') || '',
        format(new Date(room.created_at), 'dd/MM/yyyy')
      ]);
    });
    
    const roomSheet = XLSX.utils.aoa_to_sheet(roomData);
    XLSX.utils.book_append_sheet(workbook, roomSheet, 'Habitaciones');
    
    // Guardar el archivo Excel
    XLSX.writeFile(workbook, `reporte-hotel-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }, []);
  
  return {
    exportToPDF,
    exportToExcel
  };
};
