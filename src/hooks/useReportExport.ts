
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Guest, Room, Reservation } from '@/types/hotel';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReportExport = () => {
  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []) as Guest[];
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) throw error;
      
      return (data || []).map(room => ({
        ...room,
        type: room.type as Room['type'],
        status: room.status as Room['status'],
        price: Number(room.price),
        capacity: Number(room.capacity),
        amenities: room.amenities || []
      })) as Room[];
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(reservation => ({
        ...reservation,
        status: reservation.status as Reservation['status'],
        guests_count: Number(reservation.guests_count),
        total_amount: Number(reservation.total_amount),
        confirmation_number: reservation.id
      })) as Reservation[];
    },
  });

  const exportToPDF = useCallback((reservationData: Reservation[], guestData: Guest[], roomData: Room[]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Hotel', 20, 20);
    
    const tableData = reservationData.map(reservation => {
      const guest = guestData.find(g => g.id === reservation.guest_id);
      const room = roomData.find(r => r.id === reservation.room_id);
      
      return [
        reservation.confirmation_number,
        guest ? `${guest.first_name} ${guest.last_name}` : 'N/A',
        room ? room.number : 'N/A',
        reservation.check_in,
        reservation.check_out,
        reservation.status,
        `$${reservation.total_amount}`
      ];
    });

    (doc as any).autoTable({
      head: [['Confirmación', 'Huésped', 'Habitación', 'Check-in', 'Check-out', 'Estado', 'Total']],
      body: tableData,
      startY: 30,
    });

    doc.save('reporte-hotel.pdf');
  }, []);

  const exportToExcel = useCallback((reservationData: Reservation[], guestData: Guest[], roomData: Room[]) => {
    const data = reservationData.map(reservation => {
      const guest = guestData.find(g => g.id === reservation.guest_id);
      const room = roomData.find(r => r.id === reservation.room_id);
      
      return {
        'Número de Confirmación': reservation.confirmation_number,
        'Huésped': guest ? `${guest.first_name} ${guest.last_name}` : 'N/A',
        'Email': guest?.email || 'N/A',
        'Teléfono': guest?.phone || 'N/A',
        'Habitación': room?.number || 'N/A',
        'Tipo de Habitación': room?.type || 'N/A',
        'Check-in': reservation.check_in,
        'Check-out': reservation.check_out,
        'Número de Huéspedes': reservation.guests_count,
        'Monto Total': reservation.total_amount,
        'Estado': reservation.status,
        'Creado por': reservation.created_by || 'Sistema',
        'Fecha de Creación': new Date(reservation.created_at).toLocaleDateString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, 'reporte-reservas.xlsx');
  }, []);

  const exportGuestsToExcel = useCallback(() => {
    const guestData = guests.map(guest => ({
      'Nombre': guest.first_name,
      'Apellido': guest.last_name,
      'Email': guest.email,
      'Teléfono': guest.phone,
      'Documento': guest.document,
      'Fecha de Registro': new Date(guest.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(guestData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guests');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'guests.xlsx');
  }, [guests]);

  const exportRoomsToExcel = useCallback(() => {
    const roomData = rooms.map(room => ({
      'Número': room.number,
      'Tipo': room.type,
      'Precio': room.price,
      'Capacidad': room.capacity,
      'Estado': room.status,
      'Comodidades': room.amenities?.join(', ') || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(roomData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'rooms.xlsx');
  }, [rooms]);

  const exportReservationsToExcel = useCallback(() => {
    const reservationData = reservations.map(reservation => ({
      'Número de Confirmación': reservation.confirmation_number,
      'Huésped': reservation.guest_id,
      'Habitación': reservation.room_id,
      'Check-in': reservation.check_in,
      'Check-out': reservation.check_out,
      'Número de Huéspedes': reservation.guests_count,
      'Monto Total': reservation.total_amount,
      'Estado': reservation.status,
      'Creado por': reservation.created_by,
      'Fecha de Creación': new Date(reservation.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(reservationData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'reservations.xlsx');
  }, [reservations]);

  return {
    exportToPDF,
    exportToExcel,
    exportGuestsToExcel,
    exportRoomsToExcel,
    exportReservationsToExcel
  };
};
