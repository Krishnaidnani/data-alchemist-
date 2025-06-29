import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemInstruction = `
You are a rules converter. Based on the user's natural language input, return a strict JSON rule object that fits one of the following types:
1. { type: "coRun", tasks: [TaskID1, TaskID2, ...] }
2. { type: "slotRestriction", group: "...", minSlots: N }
3. { type: "loadLimit", group: "...", maxPerPhase: N }
4. { type: "phaseWindow", task: "...", phases: [N, N, ...] }

Only return the JSON object, no explanation or markdown formatting.
`;

  const result = await model.generateContent([systemInstruction, prompt]);
  const text = result.response.text().trim();

  const clean = text
    .replace(/```(?:json)?/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    const parsed = JSON.parse(clean);
    return NextResponse.json({ rule: parsed });

  }  catch (err) {
  console.error('Parsing failed:', err);
  return NextResponse.json(
    { error: 'Could not parse rule' },
    { status: 400 }
  );

  }
}
