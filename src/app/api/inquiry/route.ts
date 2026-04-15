import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, notes, type = 'general_inquiry' } = body;

    // 1. Save to Supabase
    const { data, error } = await supabase
      .from('inquiries')
      .insert([
        { 
          first_name: firstName, 
          last_name: lastName, 
          email: email, 
          phone: phone, 
          message: notes,
          type: type,
          status: 'new'
        }
      ])
      .select();

    if (error) throw error;

    // 2. Trigger notification (optional, but good practice)
    await fetch(`${new URL(request.url).origin}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_inquiry',
        data: { firstName, email, type }
      })
    }).catch(err => console.error('Notification failed:', err));

    return NextResponse.json({ success: true, inquiryId: data[0].id });
  } catch (error: any) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
