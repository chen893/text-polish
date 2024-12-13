import { NextResponse } from 'next/server';
import { polishText } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const polishedText = await polishText(text);
    return NextResponse.json({ polishedText });
  } catch (error) {
    console.error('Error in polish API:', error);
    return NextResponse.json(
      { error: 'Failed to polish text' },
      { status: 500 }
    );
  }
}
