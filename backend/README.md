# Quote Craft Backend

A Node.js Express server that securely handles API keys for external services like OpenAI, Claude (Anthropic), and DatoCMS.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if using bun
   bun install
   ```

3. Copy the environment file and add your API keys:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual API keys.

4. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

- `POST /api/openai/chat` - Proxy to OpenAI Chat Completions API
- `POST /api/claude/messages` - Proxy to Anthropic Claude Messages API
- `POST /api/dato/query` - Proxy to DatoCMS GraphQL API
- `GET /api/health` - Health check endpoint

## Security Notes

- Never commit your `.env` file to version control
- API keys are stored server-side only
- CORS is enabled for frontend requests
- All external API calls are proxied through this server to keep keys secure