import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a JSON Schema generator. Given a description of data, generate a JSON Schema that matches the description. 
          Follow these rules:
          1. Use appropriate types (string, number, boolean, array, object)
          2. Add required fields when they are essential
          3. Use descriptive property names
          4. Add descriptions for complex fields
          5. Use proper JSON Schema format`
        },
        {
          role: "user",
          content: `Generate a JSON Schema for this data description: ${query}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    // Parse the response to ensure it's valid JSON
    const schemaStr = completion.choices[0].message.content || '';
    if (!schemaStr) {
      throw new Error('No schema generated');
    }
    const schema = JSON.parse(schemaStr);

    return NextResponse.json({ schema });
  } catch (error) {
    console.error('Error generating schema:', error);
    return NextResponse.json(
      { error: 'Failed to generate schema' },
      { status: 500 }
    );
  }
}
