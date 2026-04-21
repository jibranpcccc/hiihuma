import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = loadSettings();
  return NextResponse.json({
    deepSeekApiKey: s.DeepSeekApiKey ? '***set***' : '',
    hasDeepSeek: !!s.DeepSeekApiKey,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    saveSettings({
      DeepSeekApiKey: body.deepSeekApiKey ?? undefined,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
