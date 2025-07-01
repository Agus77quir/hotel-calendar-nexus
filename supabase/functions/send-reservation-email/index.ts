
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomatedReservationEmailRequest {
  to: string | string[]; // Permitir tanto string como array de strings
  subject: string;
  guestName: string;
  emailContent: string;
  reservationDetails?: {
    id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
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
      subject, 
      guestName, 
      emailContent, 
      reservationDetails 
    }: AutomatedReservationEmailRequest = await req.json();

    // Convertir to a array si es string
    const recipients = Array.isArray(to) ? to : [to];
    
    console.log('Enviando email de confirmación a:', recipients);
    console.log('Asunto:', subject);
    console.log('Huésped:', guestName);
    console.log('Detalles de reserva:', reservationDetails);

    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Usar el dominio gratuito de Resend (sin configuración adicional)
    const fromEmail = 'onboarding@resend.dev'; // Dominio gratuito de Resend

    // Send real email using Resend with their free domain to multiple recipients
    const emailResponse = await resend.emails.send({
      from: `Hotel Nardini S.R.L <${fromEmail}>`,
      to: recipients, // Ahora puede ser un array de emails
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">🏨 Hotel Nardini S.R.L</h1>
            <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.6; color: #333; margin: 0;">${emailContent}</pre>
            </div>
          </div>
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            <p>Este es un correo automático. Por favor no responda a este mensaje.</p>
            <p>Hotel Nardini S.R.L - Su estadía perfecta nos espera</p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error enviando email con Resend:', emailResponse.error);
      throw new Error(`Error enviando email: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`);
    }

    console.log('✅ Email enviado exitosamente con Resend:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email de confirmación enviado exitosamente a ${recipients.length} destinatario(s)`,
        emailId: emailResponse.data?.id,
        recipients: recipients,
        recipientCount: recipients.length,
        emailResponse: emailResponse
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
    console.error("Error en función de email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error desconocido al enviar email',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
