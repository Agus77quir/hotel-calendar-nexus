
import { Room } from '@/types/hotel';

export const calculateRoomPrice = (room: Room, guestCount: number): number => {
  // Si hay solo un huésped y existe precio de ocupación individual
  if (guestCount === 1 && room.single_occupancy_price && room.single_occupancy_price > 0) {
    return room.single_occupancy_price;
  }
  
  // Precio normal para múltiples huéspedes o si no hay precio individual definido
  return room.price;
};

export const getRoomPriceLabel = (room: Room, guestCount: number): string => {
  const price = calculateRoomPrice(room, guestCount);
  
  if (guestCount === 1 && room.single_occupancy_price && room.single_occupancy_price > 0) {
    return `$${price} (ocupación individual)`;
  }
  
  return `$${price}`;
};
