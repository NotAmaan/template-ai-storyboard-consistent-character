/**
 * POST /storybook/script
 *
 * Generate a script from a story idea
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ScriptGenerationRequestSchema } from '../schemas/index.js';
import { generateScript } from '../lib/script-generator.js';
import { formatError } from '../lib/utils.js';
import { logRequest, logError, logStory, logResponse } from '../lib/logger.js';

export const scriptRoute = new Hono();

/**
 * POST /storybook/script
 * Generate a screenplay from a story idea
 */
scriptRoute.post('/', zValidator('json', ScriptGenerationRequestSchema), async (c) => {
  const startTime = Date.now();
  const request = c.req.valid('json');

  // Log request
  logRequest('/storybook/script', 'POST', { idea: request.idea?.substring(0, 100) });

  try {
    console.log('\n' + '='.repeat(80));
    console.log('📝 POST /storybook/script - Script Generation Request');
    console.log('='.repeat(80));

    // Generate the script
    const script = await generateScript(request);

    const totalTime = Date.now() - startTime;

    console.log('✅ Script generation completed successfully');
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log('='.repeat(80) + '\n');

    // Log successful generation
    logStory('script', script, { idea: request.idea, genre: request.genre, tone: request.tone });
    logResponse('/storybook/script', true, totalTime, { scenes: script.scenes.length });

    return c.json({
      success: true,
      data: script,
      meta: {
        generationTime: totalTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Error in script generation endpoint:', error);

    // Log error
    logError('/storybook/script', error, { idea: request.idea });
    logResponse('/storybook/script', false, totalTime);

    return c.json(
      {
        success: false,
        error: formatError(error, 'SCRIPT_GENERATION_ERROR'),
      },
      500
    );
  }
});
