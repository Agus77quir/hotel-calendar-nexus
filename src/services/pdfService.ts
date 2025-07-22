import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Reservation, Guest, Room } from '@/types/hotel';

// Function to generate a PDF for a reservation
export const generateReservationPDF = (reservation: Reservation, guest: Guest, room: Room) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Confirmación de Reserva', 20, 20);

  // Reservation information
  doc.setFontSize(12);
  doc.text(`Número de Confirmación: ${reservation.confirmation_number}`, 20, 40);
  doc.text(`Fecha de Reserva: ${new Date(reservation.created_at).toLocaleDateString()}`, 20, 50);
  doc.text(`Check-in: ${new Date(reservation.check_in).toLocaleDateString()}`, 20, 60);
  doc.text(`Check-out: ${new Date(reservation.check_out).toLocaleDateString()}`, 20, 70);

  // Guest information
  doc.text(`Nombre: ${guest.first_name} ${guest.last_name}`, 20, 80);
  doc.text(`Email: ${guest.email}`, 20, 90);
  doc.text(`Teléfono: ${guest.phone}`, 20, 100);
  doc.text(`Documento: ${guest.document}`, 20, 110);

  // Room information
  doc.text(`Habitación: ${room.number} (${room.type})`, 20, 120);
  doc.text(`Precio por noche: $${room.price}`, 20, 130);

  // Total amount
  doc.setFontSize(14);
  doc.text(`Total: $${reservation.total_amount}`, 20, 140);

  // Save the PDF
  doc.save(`reserva_${reservation.confirmation_number}.pdf`);
};
