import { NextResponse } from 'next/server';
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from 'zod';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const app = new FirecrawlApp({
  apiKey: FIRECRAWL_API_KEY || ''
});

// Define request schema
const extractRequestSchema = z.object({
  urls: z.array(z.string()).min(1),
  query: z.string(),
  schema: z.object({}).passthrough()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { urls, query, schema } = extractRequestSchema.parse(body);

    console.log('Extracting mock data for:', { urls, query, schema });

    // Generate mock data based on schema
    const mockData = urls.map(url => {
      // Create mock data that matches common financial data points
      const data = {
        stockPrice: "$699.42",
        marketCap: "1.73T",
        volume: "23.4M",
        peRatio: "34.5",
        dayRange: "$695.20 - $705.30",
        yearRange: "$580.00 - $720.50",
        dividend: "0.32%",
        eps: "20.15",
        source: url,
        lastUpdated: new Date().toISOString()
      };

      return {
        url,
        data,
        metadata: {
          extractedAt: new Date().toISOString(),
          confidence: 0.95
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request'
    }, { status: 400 });
  }
}
