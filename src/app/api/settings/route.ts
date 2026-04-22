import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = loadSettings();
  const key = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || s.DeepSeekApiKey;
  return NextResponse.json({
    deepSeekApiKey: key || '',
    hasDeepSeek: !!key,
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
