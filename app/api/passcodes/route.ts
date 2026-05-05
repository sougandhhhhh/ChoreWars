import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'passcodes.json');

// Default passcodes for all profiles if the file doesn't exist
const DEFAULT_PASSCODES = {
  sanjjay: '2255',
  prathik: '2255',
  sougandh: '2255',
  haady: '2255',
  chris: '2255',
};

async function getPasscodes() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, create and return default
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_PASSCODES, null, 2));
    return DEFAULT_PASSCODES;
  }
}

export async function GET() {
  const passcodes = await getPasscodes();
  return NextResponse.json(passcodes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, passcode } = body;

    if (!profileId || !passcode || passcode.length !== 4) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const passcodes = await getPasscodes();
    passcodes[profileId] = passcode;

    await fs.writeFile(DB_PATH, JSON.stringify(passcodes, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
