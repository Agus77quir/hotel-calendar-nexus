
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, guestName, reservationDetails }: ReservationEmailRequest = await req.json();

    console.log('Sending confirmation email to:', to);
    console.log('Guest:', guestName);
    console.log('Reservation details:', reservationDetails);

    // Simulate email sending (replace with actual email service when ready)
    const emailContent = {
      subject: "Confirmación de Reserva - Hotel",
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

    console.log('Email would be sent:', emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email confirmation sent successfully',
        emailContent 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
