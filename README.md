# LLM API Engine

<p align="center">
  <img src="https://img.youtube.com/vi/8kUeK1Bo4mM/maxresdefault.jpg" alt="LLM API Engine" width="600"/>
</p>

Build and deploy AI-powered APIs in seconds. This project allows you to create custom APIs that extract structured data from websites using natural language descriptions, powered by LLMs and web scraping technology.

## Features

- 🤖 Natural Language API Creation - Describe your data needs in plain English
- 🔄 Automatic Schema Generation using OpenAI
- 🌐 Intelligent Web Scraping with Firecrawl
- ⚡ Real-time Data Updates with scheduled scraping
- 🚀 Instant API Deployment
- 📊 Structured Data Output with JSON Schema validation
- 💾 Redis-powered Caching and Storage

## Architecture

The LLM API Engine is designed with flexibility in mind:

1. **API Builder**: The Next.js application serves as the builder interface where you create and configure your endpoints.
2. **Consumable Endpoints**: Once created, your API endpoints can be deployed and consumed anywhere:
   - Cloudflare Workers (documentation coming soon)
   - Vercel Edge Functions
   - AWS Lambda
   - Any platform that can handle HTTP requests

This decoupled architecture means you can:
- Use the Next.js app solely for endpoint creation and management
- Deploy your consumable endpoints separately for optimal performance
- Scale your API consumption independent of the management interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **APIs**: OpenAI, Firecrawl, Upstash Redis
- **Data Validation**: Zod
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Upstash Redis account
- OpenAI API key
- Firecrawl API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/developersdigest/llm-api-engine.git
cd llm-api-engine
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_FIRECRAWL_API_KEY=your_firecrawl_key
SERPER_API_KEY=your_serper_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
NEXT_PUBLIC_API_ROUTE=http://localhost:3000  # Your API base URL
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment Options

The LLM API Engine is designed with a modular architecture that separates the API builder interface from the actual API endpoints. This means you can:

1. **Use the Builder Interface Only**
   - Deploy the Next.js app for API creation and management
   - Use it to generate and test your API configurations
   - Store configurations in Redis for later use

2. **Independent API Deployment**
   - Take the generated route configurations and deploy them anywhere
   - Implement the routes in your preferred framework:
     ```typescript
     // Example with Hono
     import { Hono } from 'hono'
     const app = new Hono()
     
     app.get('/api/results/:endpoint', async (c) => {
       const data = await redis.get(`api/results/${c.req.param('endpoint')}`)
       return c.json(data)
     })
     ```
   - Framework options:
     - Cloudflare Workers with Hono
     - Express.js standalone server
     - AWS Lambda with API Gateway
     - Any HTTP server framework

3. **Hybrid Approach**
   - Use the builder for configuration
   - Deploy endpoints separately for optimal performance
   - Keep configurations in sync via Redis

This flexibility allows you to:
- Scale API endpoints independently
- Choose the best deployment platform for your needs
- Optimize for cost and performance
- Maintain full control over your API infrastructure

## Usage

1. **Describe Your API**: Enter a natural language description of the data you want to extract
2. **Generate Schema**: The system will automatically generate a JSON schema
3. **Configure Sources**: Select websites to extract data from
4. **Deploy**: Get an instant API endpoint with your structured data

### Example

```bash
# Create an API to extract company information
curl -X POST "https://your-domain.com/api/deploy" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Extract company name, revenue, and employee count",
    "urls": ["https://example.com/company"],
    "schedule": "0 5 * * *"
  }'
```

## API Documentation

### Endpoints

- `POST /api/generate-schema` - Generate JSON schema from description
- `POST /api/extract` - Extract data from URLs
- `POST /api/deploy` - Deploy a new API endpoint
- `GET /api/routes` - List all deployed routes
- `GET /api/results/:endpoint` - Get results for a specific endpoint

### CRON Implementation (Coming Soon)

The LLM API Engine will support automated data updates through various CRON implementations:

1. **Vercel Cron Jobs (Free Tier)**
   - Leverage Vercel's built-in CRON functionality
   - Free tier includes 1 execution per day
   - Configure via `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/update",
       "schedule": "0 0 * * *"
     }]
   }
   ```

2. **Upstash QStash (Alternative)**
   - Reliable scheduling service with more frequent updates
   - Better control over execution timing
   - Webhook-based triggering

3. **GitHub Actions Workflow**
   - Free alternative for open-source projects
   - Flexible scheduling options
   - Direct integration with your repository

Choose the implementation that best fits your needs based on:
- Required update frequency
- Budget constraints
- Infrastructure preferences

Stay tuned for detailed implementation guides for each option!

### API Usage Example

To fetch data from your deployed endpoint:

```bash
curl -X GET "${API_ROUTE}/api/results/nvidia-market-cap" \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json"
```

The API will return data in the following format:

```json
{
  "success": true,
  "data": {
    // Your extracted data here
  },
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "sources": [
    "https://example.com/source1",
    "https://example.com/source2"
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Web scraping by [Firecrawl](https://firecrawl.dev/)
- Data storage by [Upstash](https://upstash.com/)

## Roadmap

### 🚧 In Progress: CRON Functionality

Currently working on implementing scheduled data extraction with the following planned features:
- Backend CRON implementation using Vercel
- Rate limiting and retry mechanisms
- Job queue for concurrent scrapes
- Schedule management dashboard
- Job history and monitoring
- Email notifications for failed jobs
# llm-api-engine
