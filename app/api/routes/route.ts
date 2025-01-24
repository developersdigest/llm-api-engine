import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function GET() {
  try {
    // Get all keys matching the pattern
    const keys = await redis.keys('api/results/*');
    const routes = [];

    for (const key of keys) {
      const config = await redis.get(key);
      if (config) {
        const endpoint = key.replace('api/results/', '');
        routes.push({
          endpoint,
          config: typeof config === 'string' ? JSON.parse(config) : config,
          url: `/api/results/${endpoint}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint parameter is required'
      }, { status: 400 });
    }

    // Get the existing configuration
    const configKey = `api/results/${endpoint}`;
    const config = await redis.get(configKey);
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Route not found'
      }, { status: 404 });
    }

    // Re-run extraction with existing configuration
    const extractResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const extractData = await extractResponse.json();
    if (!extractData.success) {
      throw new Error(extractData.error);
    }

    // Update the results
    await redis.set(configKey, {
      ...config,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Route updated successfully',
      data: extractData.data
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update route' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint parameter is required'
      }, { status: 400 });
    }

    // Delete the route
    await redis.del(`api/results/${endpoint}`);

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { endpoint, urls, query, schema } = await req.json();

    if (!endpoint || !urls || !query || !schema) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: endpoint, urls, query, and schema are required'
      }, { status: 400 });
    }

    // Extract data using the provided configuration
    const extractResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, query, schema })
    });

    const extractData = await extractResponse.json();
    if (!extractData.success) {
      throw new Error(extractData.error);
    }

    // Store the configuration and initial results
    const configKey = `api/results/${endpoint}`;
    await redis.set(configKey, {
      urls,
      query,
      schema,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Route deployed successfully',
      data: extractData.data,
      url: `/api/results/${endpoint}`
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy route' },
      { status: 500 }
    );
  }
}
