import { NextResponse } from 'next/server';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const serperApiKey = SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY is not configured');
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    });

    if (!response.ok) {
      throw new Error('Serper API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
