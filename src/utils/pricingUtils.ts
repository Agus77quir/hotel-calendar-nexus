
import { Room } from '@/types/hotel';

export const calculateRoomPrice = (room: Room, guestCount: number): number => {
  // Tipos de habitaciones que son para múltiples personas
  const multipleGuestRoomTypes = ['triple-individual', 'triple-matrimonial', 'doble-individual', 'matrimonial'];
  
  // Si hay solo un huésped en una habitación para múltiples personas, aplicar descuento del 20%
  if (guestCount === 1 && multipleGuestRoomTypes.includes(room.type)) {
    return room.price * 0.8; // 20% de descuento
  }
  
  // Si hay solo un huésped y existe precio de ocupación individual específico
  if (guestCount === 1 && room.single_occupancy_price && room.single_occupancy_price > 0) {
    return room.single_occupancy_price;
  }
  
  // Precio normal para múltiples huéspedes o habitaciones individuales
  return room.price;
};

export const getRoomPriceLabel = (room: Room, guestCount: number): string => {
  const price = calculateRoomPrice(room, guestCount);
  const multipleGuestRoomTypes = ['triple-individual', 'triple-matrimonial', 'doble-individual', 'matrimonial'];
  
  // Si hay descuento automático por ocupación individual en habitación múltiple
  if (guestCount === 1 && multipleGuestRoomTypes.includes(room.type)) {
    return `$${price} (20% desc. ocupación individual)`;
  }
  
  // Si hay precio específico de ocupación individual
  if (guestCount === 1 && room.single_occupancy_price && room.single_occupancy_price > 0) {
    return `$${price} (ocupación individual)`;
  }
  
  return `$${price}`;
};
