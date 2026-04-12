import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'new_reservation') {
      // 1. Email via Resend
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'info@grapow.com';

      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Gra Pow Reservations <reservations@grapow.com>',
            to: [RESTAURANT_EMAIL],
            subject: `New Reservation: ${data.first_name} ${data.last_name} (${data.party_size} guests)`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #E8A000; text-transform: uppercase;">New Reservation Confirmed</h2>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p><strong>Customer:</strong> ${data.first_name} ${data.last_name}</p>
                <p><strong>Party Size:</strong> ${data.party_size}</p>
                <p><strong>Date/Time:</strong> ${new Date(data.reservation_time).toLocaleString()}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
                <div style="margin-top: 30px; font-size: 12px; color: #999;">
                  Sent from Gra Pow Riverside Reservation System
                </div>
              </div>
            `
          })
        }).catch(err => console.error('Resend error:', err));
      }

      // 2. Google Sheets via Google Apps Script (Standard Webhook)
      const GAS_WEBHOOK = process.env.GOOGLE_SHEETS_SCRIPT_URL;
      if (GAS_WEBHOOK) {
        await fetch(GAS_WEBHOOK, {
          method: 'POST',
          body: JSON.stringify(data)
        }).catch(err => console.error('Google Sheets Script error:', err));
      }

      // 3. Discord/Slack Webhook
      const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🔔 **New Reservation at Gra Pow!**`,
            embeds: [{
              title: `Table for ${data.party_size}`,
              fields: [
                { name: 'Customer', value: `${data.first_name} ${data.last_name}`, inline: true },
                { name: 'Time', value: new Date(data.reservation_time).toLocaleString(), inline: true },
                { name: 'Phone', value: data.phone, inline: true },
                { name: 'Email', value: data.email, inline: true },
                { name: 'Notes', value: data.notes || 'None' }
              ],
              color: 0xE8A000
            }]
          })
        }).catch(err => console.error('Discord webhook error:', err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
