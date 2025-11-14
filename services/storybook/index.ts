/**
 * Storybook Services - Main Entry Point
 *
 * A modular, well-typed Hono-based HTTP service for generating
 * story scripts and storyboard images using AI.
 *
 * Features:
 * - Script generation from story ideas
 * - Image generation for storyboards
 * - Combined storybook creation (script + images)
 * - Multiple visual styles support
 * - Full TypeScript support with Zod validation
 *
 * Built with:
 * - Hono: Ultra-fast web framework
 * - Zod: Runtime type validation
 * - Google Generative AI: Script and image generation
 * - Mastra: Agent orchestration
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { scriptRoute } from './routes/script.js';
import { photosRoute } from './routes/photos.js';
import { storybooksRoute } from './routes/storybooks.js';
import { stylesRoute } from './routes/styles.js';
import { validateEnvironment } from './lib/utils.js';

// Create main Hono app
const app = new Hono();

// ============================================================================
// Middleware
// ============================================================================

// Enable logging
app.use('*', logger());

// Enable CORS
app.use('*', cors({
  origin: '*', // Configure this appropriately for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Pretty JSON responses in development
app.use('*', prettyJSON());

// ============================================================================
// Health Check & Info
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (c) => {
  const envCheck = validateEnvironment();

  return c.json({
    status: 'ok',
    service: 'storybook-services',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: {
      valid: envCheck.valid,
      missing: envCheck.missing,
    },
  });
});

/**
 * GET /
 * API information and available endpoints
 */
app.get('/', (c) => {
  return c.json({
    service: 'Storybook Services',
    version: '1.0.0',
    description: 'AI-powered storybook and script generation service',
    documentation: {
      endpoints: [
        {
          method: 'POST',
          path: '/storybook/script',
          description: 'Generate a screenplay from a story idea',
          input: {
            idea: 'string (required, min 10 chars)',
            genre: 'string (optional)',
            length: 'enum: short, medium, long (default: short)',
            tone: 'enum: dramatic, comedy, thriller, etc. (optional)',
            targetAudience: 'enum: family, adult, teen, children (optional)',
          },
        },
        {
          method: 'POST',
          path: '/storybook/photos',
          description: 'Generate images for storyboard scenes',
          input: {
            storyboard: 'StoryboardData (required)',
            style: 'string (default: Cinematic)',
            quality: 'enum: standard, high (default: standard)',
            aspectRatio: 'enum: 1:1, 16:9, 4:3, 3:2 (default: 16:9)',
            sceneNumbers: 'number[] (optional)',
          },
        },
        {
          method: 'POST',
          path: '/storybooks',
          description: 'Generate complete storyboard (script + images)',
          input: {
            idea: 'string (optional, min 10 chars)',
            script: 'string (optional, min 10 chars)',
            numberOfImages: 'number (1-12, default: 5)',
            style: 'string (default: Cinematic)',
            quality: 'enum: standard, high (default: standard)',
            title: 'string (optional)',
            note: 'Either idea or script must be provided',
          },
        },
        {
          method: 'GET',
          path: '/storybook/styles',
          description: 'Get all available visual styles',
        },
        {
          method: 'GET',
          path: '/storybook/styles/:name',
          description: 'Get details about a specific style',
        },
        {
          method: 'GET',
          path: '/health',
          description: 'Service health check',
        },
      ],
      availableStyles: [
        'Cinematic', 'Photographic', 'Anime', 'Manga', 'Ghibli-esque',
        'Disney-esque', 'Comic Book', 'Graphic Novel', 'Watercolor',
        'Low Poly', 'Pixel Art', 'Steampunk', 'Cyberpunk',
        'Fantasy Art', 'Film Noir',
      ],
    },
    examples: {
      generateScript: {
        endpoint: 'POST /storybook/script',
        body: {
          idea: 'A young inventor builds a flying machine to cross a vast canyon',
          genre: 'adventure',
          length: 'short',
          tone: 'dramatic',
        },
      },
      generateCompleteStorybook: {
        endpoint: 'POST /storybooks',
        body: {
          idea: 'A detective solves a mystery in a cyberpunk city',
          numberOfImages: 5,
          style: 'Cyberpunk',
          title: 'Neon Nights',
        },
      },
    },
  });
});

// ============================================================================
// Route Registration
// ============================================================================

// Mount routes
app.route('/storybook/script', scriptRoute);
app.route('/storybook/photos', photosRoute);
app.route('/storybooks', storybooksRoute);
app.route('/storybook/styles', stylesRoute);

// ============================================================================
// Error Handling
// ============================================================================

/**
 * 404 Not Found handler
 */
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: c.req.path,
      },
    },
    404
  );
});

/**
 * Global error handler
 */
app.onError((err, c) => {
  console.error('❌ Unhandled error:', err);

  return c.json(
    {
      success: false,
      error: {
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    },
    500
  );
});

// ============================================================================
// Server Startup
// ============================================================================

const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('\n' + '='.repeat(80));
console.log('🎬 Storybook Services Starting...');
console.log('='.repeat(80));

// Validate environment
const envCheck = validateEnvironment();
if (!envCheck.valid) {
  console.error('❌ Missing required environment variables:', envCheck.missing);
  console.error('Please set the following environment variables:');
  envCheck.missing.forEach(key => console.error(\`  - \${key}\`));
  console.error('\nService will start but some features may not work.');
  console.error('='.repeat(80) + '\n');
}

console.log('✅ Environment validated');
console.log(\`🚀 Server starting on port \${PORT}\`);
console.log('📋 Available endpoints:');
console.log('  - POST /storybook/script');
console.log('  - POST /storybook/photos');
console.log('  - POST /storybooks');
console.log('  - GET  /storybook/styles');
console.log('  - GET  /storybook/styles/:name');
console.log('  - GET  /health');
console.log('  - GET  /');
console.log('='.repeat(80) + '\n');

export default {
  port: PORT,
  fetch: app.fetch,
};
