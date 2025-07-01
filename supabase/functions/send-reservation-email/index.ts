
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: ReservationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Hotel Nardini S.R.L <reservas@hotelnardini.com>",
      to: [emailData.to_email],
      subject: emailData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">Hotel Nardini S.R.L</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #27ae60;">¡Reserva Confirmada!</h2>
            <p>Estimado/a <strong>${emailData.to_name}</strong>,</p>
            <p>¡Gracias por elegir Hotel Nardini S.R.L! Nos complace confirmar su reserva.</p>
          </div>

          <div style="background-color: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">📋 DETALLES DE SU RESERVA:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>• Número de Reserva:</strong> ${emailData.reservation_number}</li>
              <li style="margin: 8px 0;"><strong>• Hotel:</strong> ${emailData.hotel_name}</li>
              <li style="margin: 8px 0;"><strong>• Fecha de Llegada:</strong> ${emailData.check_in}</li>
              <li style="margin: 8px 0;"><strong>• Fecha de Salida:</strong> ${emailData.check_out}</li>
              <li style="margin: 8px 0;"><strong>• Tipo de Habitación:</strong> Habitación #${emailData.room_number} - ${emailData.room_type}</li>
            </ul>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">🏨 INFORMACIÓN IMPORTANTE:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Check-in:</strong> A partir de las 15:00 horas</li>
              <li><strong>Check-out:</strong> Hasta las 12:00 horas</li>
              <li><strong>Políticas de Cancelación:</strong> Cancelación gratuita hasta 24 horas antes de la llegada</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🎁 SERVICIOS INCLUIDOS:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Desayuno incluido</li>
              <li>WiFi gratuito</li>
              <li>Acceso a la piscina</li>
            </ul>
          </div>

          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">📝 INSTRUCCIONES ESPECIALES:</h3>
            <p style="margin: 0;">Por favor, presente un documento de identidad válido al momento del check-in</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 16px;">Estamos emocionados de recibirle y hacer que su estadía sea memorable.</p>
            <p style="color: #6c757d; font-size: 16px;"><strong>¡Esperamos verle pronto!</strong></p>
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">Saludos cordiales,<br>Equipo de Hotel Nardini S.R.L</p>
          </div>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">Este es un correo de confirmación automática.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending reservation email:", error);
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
