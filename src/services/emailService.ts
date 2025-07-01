
// Servicio de email completamente automático usando Supabase Edge Functions
import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  reservation_number: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  room_number: string;
}

export const sendAutomaticEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('Sending automatic email to:', emailData.to_email);
    
    const { data, error } = await supabase.functions.invoke('send-reservation-email', {
      body: emailData
    });

    if (error) {
      console.error('Error calling email function:', error);
      throw error;
    }

    if (data?.success) {
      console.log('Email sent successfully via Edge Function');
      return true;
    } else {
      console.error('Email function returned error:', data);
      return false;
    }
  } catch (error) {
    console.error('Error in sendAutomaticEmail:', error);
    return false;
  }
};

// Función de respaldo - ya no se usa pero se mantiene por compatibilidad
export const sendEmailViaAPI = async (emailData: EmailData): Promise<boolean> => {
  console.log('sendEmailViaAPI is deprecated, using Edge Function instead');
  return sendAutomaticEmail(emailData);
};
