import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, passcode');

    if (error) throw error;

    // Convert array to the Record format { id: passcode }
    const passcodeMap = (profiles || []).reduce((acc: Record<string, string>, p: any) => {
      acc[p.id] = p.passcode || '2255';
      return acc;
    }, {});

    return NextResponse.json(passcodeMap);
  } catch (error) {
    console.error('API Error (GET):', error);
    return NextResponse.json({ error: 'Failed to fetch passcodes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, passcode } = body;

    if (!profileId || !passcode || passcode.length !== 4) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ passcode: passcode })
      .eq('id', profileId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error (POST):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
