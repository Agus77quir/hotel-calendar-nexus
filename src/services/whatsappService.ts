
import { Reservation, Guest, Room } from '@/types/hotel';

export const sendReservationToWhatsApp = (
  reservation: Reservation,
  guest: Guest,
  room: Room,
  phoneNumber?: string
) => {
  // Format the reservation details for WhatsApp
  const checkInDate = new Date(reservation.check_in).toLocaleDateString('es-ES');
  const checkOutDate = new Date(reservation.check_out).toLocaleDateString('es-ES');
  
  // Calculate nights and totals
  const nights = Math.ceil((new Date(reservation.check_out).getTime() - new Date(reservation.check_in).getTime()) / (1000 * 60 * 60 * 24));
  const subtotal = room.price * nights;
  const discountAmount = guest.is_associated ? (subtotal * guest.discount_percentage) / 100 : 0;
  const total = subtotal - discountAmount;
  
  // Create the message
  let message = `🏨 *CONFIRMACIÓN DE RESERVA*\n\n`;
  message += `📋 *Información de la Reserva:*\n`;
  message += `• Número: ${reservation.id}\n`;
  message += `• Estado: ${getStatusText(reservation.status)}\n`;
  message += `• Check-in: ${checkInDate}\n`;
  message += `• Check-out: ${checkOutDate}\n`;
  message += `• Huéspedes: ${reservation.guests_count}\n\n`;
  
  message += `👤 *Información del Huésped:*\n`;
  message += `• Nombre: ${guest.first_name} ${guest.last_name}\n`;
  message += `• Email: ${guest.email}\n`;
  message += `• Teléfono: ${guest.phone}\n`;
  message += `• Documento: ${guest.document}\n`;
  message += `• Nacionalidad: ${guest.nationality}\n`;
  if (guest.is_associated) {
    message += `• Huésped Asociado: Descuento ${guest.discount_percentage}%\n`;
  }
  message += `\n`;
  
  message += `🏠 *Información de la Habitación:*\n`;
  message += `• Habitación: ${room.number}\n`;
  message += `• Tipo: ${getRoomTypeText(room.type)}\n`;
  message += `• Capacidad: ${room.capacity} personas\n`;
  message += `• Precio por noche: $${room.price}\n\n`;
  
  message += `💰 *Resumen de Costos:*\n`;
  message += `• Noches: ${nights}\n`;
  message += `• Subtotal: $${subtotal.toFixed(2)}\n`;
  if (discountAmount > 0) {
    message += `• Descuento (${guest.discount_percentage}%): -$${discountAmount.toFixed(2)}\n`;
  }
  message += `• *TOTAL: $${total.toFixed(2)}*\n`;
  
  if (reservation.special_requests) {
    message += `\n📝 *Solicitudes Especiales:*\n${reservation.special_requests}\n`;
  }
  
  message += `\n✨ ¡Gracias por elegir nuestro hotel!`;
  
  // Use the provided phone number or the guest's phone number
  const targetPhone = phoneNumber || guest.phone;
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${targetPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
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
