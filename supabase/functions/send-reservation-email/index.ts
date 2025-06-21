
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'created' | 'confirmed' | 'checkedIn' | 'checkedOut' | 'cancelled';
  guestName: string;
  reservationDetails: {
    id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    guestsCount: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    console.log('Processing email request:', emailData);

    const subjects = {
      created: 'Reserva Creada - Confirmación',
      confirmed: 'Reserva Confirmada - Hotel',
      checkedIn: 'Bienvenido - Check-in Completado',
      checkedOut: 'Gracias por su visita - Check-out',
      cancelled: 'Reserva Cancelada'
    };

    const messages = {
      created: 'Su reserva ha sido creada exitosamente. Estamos emocionados de recibirle.',
      confirmed: 'Su reserva ha sido confirmada. Por favor, llegue a la hora indicada para su check-in.',
      checkedIn: '¡Bienvenido! Su check-in ha sido completado exitosamente. Esperamos que disfrute su estadía.',
      checkedOut: 'Su check-out ha sido completado. Gracias por elegirnos y esperamos verle pronto de nuevo.',
      cancelled: 'Su reserva ha sido cancelada como solicitado. Si tiene alguna pregunta, no dude en contactarnos.'
    };

    const subject = subjects[emailData.type];
    const message = messages[emailData.type];
    
    // Format dates
    const checkInDate = new Date(emailData.reservationDetails.checkIn).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const checkOutDate = new Date(emailData.reservationDetails.checkOut).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = {
      to: emailData.to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Sistema de Gestión Hotelera</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Estimado/a ${emailData.guestName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              ${message}
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Detalles de su reserva:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">ID de Reserva:</td>
                  <td style="padding: 8px 0; color: #333;">${emailData.reservationDetails.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Habitación:</td>
                  <td style="padding: 8px 0; color: #333;">${emailData.reservationDetails.roomNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Check-in:</td>
                  <td style="padding: 8px 0; color: #333;">${checkInDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Check-out:</td>
                  <td style="padding: 8px 0; color: #333;">${checkOutDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Número de huéspedes:</td>
                  <td style="padding: 8px 0; color: #333;">${emailData.reservationDetails.guestsCount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Total:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">$${emailData.reservationDetails.totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Gracias por elegirnos. Si tiene alguna pregunta, no dude en contactarnos.
            </p>
            
            <p style="color: #666; margin-top: 30px;">
              Saludos cordiales,<br>
              <strong>Equipo del Hotel</strong>
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un mensaje automático del Sistema de Gestión Hotelera</p>
          </div>
        </div>
      `
    };

    // Log the email content for demonstration
    console.log('Email would be sent to:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    
    // In a real implementation, you would use a service like Resend here:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // const result = await resend.emails.send(emailContent);
    
    // For now, we'll simulate success
    const result = {
      success: true,
      id: 'demo-email-' + Date.now(),
      message: 'Email enviado exitosamente (demo)'
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
