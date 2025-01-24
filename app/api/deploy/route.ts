import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Updated validation schema to match the actual request format
const deployRequestSchema = z.object({
  key: z.string().min(1, "Key is required"),
  data: z.object({
    data: z.record(z.any()),
    metadata: z.object({
      query: z.string(),
      schema: z.object({
        type: z.string(),
        properties: z.record(z.any()),
        required: z.array(z.string()).optional()
      }),
      sources: z.array(z.string()),
      lastUpdated: z.string()
    })
  }),
  route: z.string().min(1, "Route is required")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received request body:', body);

    const validatedData = deployRequestSchema.parse(body);
    const { key, data, route } = validatedData;

    // Clean the route string
    const cleanRoute = route
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim();

    // Check if route already exists
    const existingRoute = await redis.get(`api/results/${cleanRoute}`);
    if (existingRoute) {
      return NextResponse.json({
        success: false,
        error: 'Route already exists'
      }, { status: 409 });
    }

    // Store the data in Redis
    await redis.set(`api/results/${cleanRoute}`, JSON.stringify(data));

    const apiRoute = process.env.API_ROUTE || 'http://localhost:3000';
    const fullUrl = `${apiRoute}/api/results/${cleanRoute}`;

    return NextResponse.json({
      success: true,
      message: 'API endpoint deployed successfully',
      route: cleanRoute,
      url: fullUrl,
      curlCommand: `curl -X GET "${fullUrl}" \\\n  -H "Authorization: Bearer sk_w4964vzs5p" \\\n  -H "Content-Type: application/json"`
    });
  } catch (error) {
    console.error('Deployment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deploy endpoint'
    }, { status: 500 });
  }
}
