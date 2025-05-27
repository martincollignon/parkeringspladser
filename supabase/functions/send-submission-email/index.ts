import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmissionPayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    parking_data: {
      name: string
      address?: string
      latitude: number
      longitude: number
      parking_type: 'short-term' | 'long-term'
      operator?: string
      fee_info?: string
      notes?: string
    }
    status: string
    created_at: string
  }
  schema: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: SubmissionPayload = await req.json()
    
    // Only process INSERT events for submissions table
    if (payload.type !== 'INSERT' || payload.table !== 'submissions') {
      return new Response('Not a submission insert', { status: 200 })
    }

    const submission = payload.record
    const parkingData = submission.parking_data

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com'

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response('Email service not configured', { status: 500 })
    }

    // Prepare email content
    const locationName = parkingData.name
    const locationType = parkingData.parking_type === 'long-term' ? 'Cykelbutik' : 'Parkeringsplads'
    const address = parkingData.address || 'Ingen adresse angivet'
    const coordinates = `${parkingData.latitude}, ${parkingData.longitude}`
    const operator = parkingData.operator || 'Ikke angivet'
    const fees = parkingData.fee_info || 'Ikke angivet'
    const notes = parkingData.notes || 'Ingen noter'

    const emailSubject = `🚗 Ny ${locationType} Indsendt: ${locationName}`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          Ny ${locationType} Indsendt
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">${locationName}</h3>
          <p style="color: #64748b; margin: 5px 0;"><strong>Type:</strong> ${locationType}</p>
          <p style="color: #64748b; margin: 5px 0;"><strong>Adresse:</strong> ${address}</p>
          <p style="color: #64748b; margin: 5px 0;"><strong>Koordinater:</strong> ${coordinates}</p>
          ${parkingData.parking_type === 'short-term' ? `
            <p style="color: #64748b; margin: 5px 0;"><strong>Operatør:</strong> ${operator}</p>
            <p style="color: #64748b; margin: 5px 0;"><strong>Priser:</strong> ${fees}</p>
          ` : ''}
          ${notes !== 'Ingen noter' ? `
            <div style="margin-top: 15px;">
              <strong style="color: #334155;">Noter:</strong>
              <p style="color: #64748b; background: white; padding: 10px; border-radius: 4px; margin: 5px 0;">${notes}</p>
            </div>
          ` : ''}
        </div>

        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Næste skridt:</strong> Gå til admin panelet for at gennemgå og godkende denne indsendelse.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/admin" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Gennemgå Indsendelse
          </a>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            København Parkering Finder - Automatisk besked
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
            Indsendt: ${new Date(submission.created_at).toLocaleString('da-DK')}
          </p>
        </div>
      </div>
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Copenhagen Parking <noreply@parkering.dk>',
        to: [adminEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Failed to send email:', errorText)
      return new Response(`Failed to send email: ${errorText}`, { status: 500 })
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        message: 'Email notification sent successfully',
        emailId: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-submission-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 