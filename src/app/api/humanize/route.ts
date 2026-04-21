import { NextResponse } from 'next/server';
import { humanizeSingleVersionStream, HUMANIZER_NAMES } from '@/lib/deepseek';
import { loadSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max timeout for Vercel/NextJS routing if deployed there

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { apiKey, content, versionIndex, voiceSample, level, tone } = body;

    level = level || 'ninja';
    tone = tone || 'conversational';

    if (!apiKey) {
      const settings = loadSettings();
      apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || settings.DeepSeekApiKey;
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'DeepSeek API Key is required. Set it in settings.' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required.' }, { status: 400 });
    }
    
    if (versionIndex === undefined || versionIndex < 0 || versionIndex > 1) {
      return NextResponse.json({ success: false, error: 'Invalid version index.' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = humanizeSingleVersionStream(apiKey, content, versionIndex, voiceSample, level, tone);
          
          for await (const event of generator) {
            const dataString = JSON.stringify(event) + '\n';
            controller.enqueue(encoder.encode(dataString));
            
            if (event.type === 'error') {
              break;
            }
          }
        } catch (err: any) {
          const errorEvent = { type: 'error', message: err.message };
          controller.enqueue(encoder.encode(JSON.stringify(errorEvent) + '\n'));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/jsonl', // JSON Lines
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}