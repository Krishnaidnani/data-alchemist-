import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt, entity } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const instruction = `Given a plain English query about ${entity} data, return a JavaScript expression string for filtering rows. Output ONLY the expression. Don't explain.`;

  try {
    const result = await model.generateContent([instruction, prompt]);
    const text = result.response.text().trim();

    const filterCode = text
      .replace(/^[`]*javascript/g, '')
      .replace(/[`]+/g, '')
      .trim();

    return NextResponse.json({ filterCode });
  } catch (error: any) {
    console.error('[Gemini API error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
