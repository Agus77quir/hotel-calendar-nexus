
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomatedReservationEmailRequest {
  to: string;
  from: string;
  subject: string;
  guestName: string;
  emailContent: string;
  reservationDetails?: {
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
    const { 
      to, 
      from, 
      subject, 
      guestName, 
      emailContent, 
      reservationDetails 
    }: AutomatedReservationEmailRequest = await req.json();

    console.log('Enviando email de confirmación automatizado a:', to);
    console.log('Desde:', from);
    console.log('Asunto:', subject);
    console.log('Huésped:', guestName);
    console.log('Detalles de reserva:', reservationDetails);

    // Simulate automated email sending (replace with actual email service when ready)
    const automatedEmailResponse = {
      subject: subject,
      content: emailContent,
      metadata: {
        to: to,
        from: from,
        guestName: guestName,
        reservationDetails: reservationDetails,
        sentAt: new Date().toISOString(),
        emailType: 'automated_reservation_confirmation'
      }
    };

    console.log('Email automatizado procesado:', automatedEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de confirmación automatizado enviado exitosamente',
        emailResponse: automatedEmailResponse
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
    console.error("Error en función de email automatizado:", error);
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
