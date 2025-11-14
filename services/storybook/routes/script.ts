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

export const scriptRoute = new Hono();

/**
 * POST /storybook/script
 * Generate a screenplay from a story idea
 */
scriptRoute.post('/', zValidator('json', ScriptGenerationRequestSchema), async (c) => {
  try {
    const request = c.req.valid('json');

    console.log('\n' + '='.repeat(80));
    console.log('📝 POST /storybook/script - Script Generation Request');
    console.log('='.repeat(80));

    const startTime = Date.now();

    // Generate the script
    const script = await generateScript(request);

    const totalTime = Date.now() - startTime;

    console.log('✅ Script generation completed successfully');
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log('='.repeat(80) + '\n');

    return c.json({
      success: true,
      data: script,
      meta: {
        generationTime: totalTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in script generation endpoint:', error);

    return c.json(
      {
        success: false,
        error: formatError(error, 'SCRIPT_GENERATION_ERROR'),
      },
      500
    );
  }
});
