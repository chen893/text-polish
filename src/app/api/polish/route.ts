import { NextResponse } from 'next/server';
import { purePolishText } from '@/lib/openai';
import { PolishOptions } from '@/types/text';

export async function POST(request: Request) {
  try {
    const { text, options } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const polishOptions: PolishOptions = options || { isPolishMode: false };
    const result = await purePolishText(text, polishOptions);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in polish API:', error);
    return NextResponse.json(
      { error: 'Failed to polish text' },
      { status: 500 }
    );
  }
}
