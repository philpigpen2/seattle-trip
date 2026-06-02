import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { imageBase64 } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: "No image" }, { status: 400 });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Look at this receipt image and extract the key details. Return ONLY a JSON object with these fields:
{
  "description": "merchant or restaurant name (short, clean name)",
  "amount": 12.34,
  "date": "May 30 2026"
}
If you cannot read a field clearly, omit it. For the date, format it as "Mon DD YYYY". Amount should be the total charged, as a number.`,
          },
          {
            type: "image_url",
            image_url: { url: imageBase64, detail: "low" },
          },
        ],
      },
    ],
    max_tokens: 150,
  });

  const text = response.choices[0].message.content ?? "";
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({});
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json({});
  }
}
