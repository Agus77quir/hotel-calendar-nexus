
import jsPDF from 'jspdf';
import { Reservation, Guest, Room } from '@/types/hotel';

export const generateReservationPDF = (
  reservation: Reservation,
  guest: Guest,
  room: Room
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMACIÓN DE RESERVA', 105, 20, { align: 'center' });
  
  // Reservation details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 40;
  
  // Reservation info
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE LA RESERVA', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Número de Reserva: ${reservation.id}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Estado: ${getStatusText(reservation.status)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Check-in: ${formatDate(reservation.check_in)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Check-out: ${formatDate(reservation.check_out)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Número de huéspedes: ${reservation.guests_count}`, 20, yPosition);
  yPosition += 15;
  
  // Guest info
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL HUÉSPED', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${guest.first_name} ${guest.last_name}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Email: ${guest.email}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Teléfono: ${guest.phone}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Documento: ${guest.document}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Nacionalidad: ${guest.nationality}`, 20, yPosition);
  if (guest.is_associated) {
    yPosition += 8;
    doc.text(`Huésped Asociado - Descuento: ${guest.discount_percentage}%`, 20, yPosition);
  }
  yPosition += 15;
  
  // Room info
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE LA HABITACIÓN', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Habitación: ${room.number}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Tipo: ${getRoomTypeText(room.type)}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Capacidad: ${room.capacity} personas`, 20, yPosition);
  yPosition += 8;
  doc.text(`Precio por noche: $${room.price}`, 20, yPosition);
  yPosition += 15;
  
  // Total calculation
  const nights = Math.ceil((new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / (1000 * 60 * 60 * 24));
  const subtotal = room.price * nights;
  const discountAmount = guest.is_associated ? (subtotal * guest.discount_percentage) / 100 : 0;
  const total = subtotal - discountAmount;
  
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE COSTOS', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Noches: ${nights}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, yPosition);
  if (discountAmount > 0) {
    yPosition += 8;
    doc.text(`Descuento (${guest.discount_percentage}%): -$${discountAmount.toFixed(2)}`, 20, yPosition);
  }
  yPosition += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: $${total.toFixed(2)}`, 20, yPosition);
  
  if (reservation.special_requests) {
    yPosition += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUDES ESPECIALES', 20, yPosition);
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(reservation.special_requests, 170);
    doc.text(splitText, 20, yPosition);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Gracias por elegir nuestro hotel', 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save(`reserva-${reservation.id}.pdf`);
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmada';
    case 'checked-in':
      return 'Registrado';
    case 'checked-out':
      return 'Check-out';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};

const getRoomTypeText = (type: string) => {
  switch (type) {
    case 'matrimonial':
      return 'Matrimonial';
    case 'triple-individual':
      return 'Triple Individual';
    case 'triple-matrimonial':
      return 'Triple Matrimonial';
    case 'doble-individual':
      return 'Doble Individual';
    case 'suite-presidencial-doble':
      return 'Suite Presidencial Doble';
    default:
      return type;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
