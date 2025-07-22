import { Reservation, Guest, Room } from '@/types/hotel';

const API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN;
const API_PHONE_ID = process.env.NEXT_PUBLIC_WHATSAPP_API_PHONE_ID;
const VERIFY_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export const sendWhatsAppConfirmation = (reservation: Reservation, guest: Guest, room: Room) => {
  const message = `
🏨 *CONFIRMACIÓN DE RESERVA*

📋 *Detalles de la Reserva:*
• Número de confirmación: ${reservation.confirmation_number}
• Huésped: ${guest.first_name} ${guest.last_name}
• Email: ${guest.email}
• Documento: ${guest.document}

🏠 *Habitación:*
• Número: ${room.number}
• Tipo: ${room.type}
• Check-in: ${reservation.check_in}
• Check-out: ${reservation.check_out}
• Huéspedes: ${reservation.guests_count}

💰 *Total: $${reservation.total_amount}*

¡Gracias por su preferencia!
  `.trim();

  console.log('WhatsApp message would be sent:', message);
  return message;
};

export const verifyWhatsAppWebhook = (mode: string, token: string, challenge: string) => {
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WH Webhook verified');
    return challenge;
  } else {
    console.log('❌ WH Webhook verification failed');
    return false;
  }
};

export const processWhatsAppWebhook = (body: any) => {
  console.log('WH Webhook event received:', body);
  // Aquí puedes procesar los eventos de WhatsApp
  return true;
};
