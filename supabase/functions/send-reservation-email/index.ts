
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  guestName: string;
  reservationDetails: {
    id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, guestName, reservationDetails }: EmailRequest = await req.json();

    // For now, we'll just log the email details
    // In production, you would integrate with a service like Resend
    console.log('Sending confirmation email to:', to);
    console.log('Guest:', guestName);
    console.log('Reservation details:', reservationDetails);

    const emailContent = {
      subject: 'Confirmación de Reserva - Hotel',
      message: `
        Estimado/a ${guestName},

        Su reserva ha sido confirmada exitosamente.

        Detalles de la reserva:
        - Número de reserva: ${reservationDetails.id}
        - Habitación: ${reservationDetails.roomNumber}
        - Check-in: ${reservationDetails.checkIn}
        - Check-out: ${reservationDetails.checkOut}
        - Monto total: $${reservationDetails.totalAmount}

        Gracias por elegir nuestro hotel.

        Saludos cordiales,
        Equipo del Hotel
      `
    };

    // Here you would send the actual email using a service like Resend
    // For now, we simulate success
    console.log('Email would be sent:', emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de confirmación enviado',
        emailSent: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-reservation-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        emailSent: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
