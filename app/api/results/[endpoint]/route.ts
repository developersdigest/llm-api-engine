import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function GET(req: Request, { params }: { params: { endpoint: string } }) {
  try {
    // Check Redis connection
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('Redis environment variables not set');
      return NextResponse.json({
        success: false,
        error: 'Redis configuration is missing'
      }, { status: 500 });
    }

    if (!params?.endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint parameter is required'
      }, { status: 400 });
    }

    const endpoint = `api/results/${params.endpoint}`;
    console.log('Fetching results for endpoint:', endpoint);

    // Get the URL parameters
    const url = new URL(req.url);
    const includeSchema = url.searchParams.get('schema') === 'true';

    // Get cached results
    const results = await redis.get(endpoint);
    console.log('Raw Redis results:', results);
    
    if (!results) {
      return NextResponse.json({
        success: false,
        error: 'No results found for this endpoint'
      }, { status: 404 });
    }

    // Parse the stored results
    let storedData;
    try {
      storedData = typeof results === 'string' ? JSON.parse(results) : results;
      console.log('Parsed stored data:', storedData);
    } catch (parseError) {
      console.error('Failed to parse stored data:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid data format in storage'
      }, { status: 500 });
    }
    
    // Return different response based on schema parameter
    if (includeSchema) {
      return NextResponse.json({
        success: true,
        data: storedData
      });
    } else {
      return NextResponse.json({
        success: true,
        data: storedData.data,
        lastUpdated: storedData.metadata?.lastUpdated,
        sources: storedData.metadata?.sources
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
