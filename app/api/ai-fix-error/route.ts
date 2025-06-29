import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { column, value, message, row, dataset } = body;

  const sampleValidValues = Array.from(
    new Set(
      dataset
        .map((entry: any) => entry[column])
        .filter((v: any) => v && v !== value)
    )
  ).slice(0, 5);

  const prompt = `
You are a data validation AI.

A column "${column}" has a value "${value}" which causes the error: "${message}".

Here is the full row context:
${JSON.stringify(row, null, 2)}

Here are some other valid values in the "${column}" column:
${sampleValidValues.join(', ')}

Suggest a corrected value for "${column}" that fits the context of this row. Respond with ONLY the corrected value. Do not include any explanation or formatting.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // or 'gemini-1.5-pro'
    const result = await model.generateContent(prompt);
    const fix = result.response.text().trim().replace(/^"|"$/g, ''); // remove quotes if present
    return NextResponse.json({ fix });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json(
      { fix: null, error: 'AI suggestion failed' },
      { status: 500 }
    );
  }
}
