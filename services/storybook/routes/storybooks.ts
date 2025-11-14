/**
 * POST /storybooks
 *
 * Generate complete storyboard (script + storyboard structure + images)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CompleteStoryboardRequestSchema } from '../schemas/index.js';
import { generateScript } from '../lib/script-generator.js';
import { createStoryboardFromScript, generateStoryboardImages } from '../lib/image-generator.js';
import { formatError, isValidStyle } from '../lib/utils.js';
import type { Script } from '../schemas/index.js';

export const storybooksRoute = new Hono();

/**
 * POST /storybooks
 * Generate a complete storyboard from an idea or script
 */
storybooksRoute.post('/', zValidator('json', CompleteStoryboardRequestSchema), async (c) => {
  try {
    const request = c.req.valid('json');

    console.log('\n' + '='.repeat(80));
    console.log('🎬 POST /storybooks - Complete Storyboard Generation Request');
    console.log('='.repeat(80));

    // Validate style
    if (!isValidStyle(request.style)) {
      return c.json(
        {
          success: false,
          error: {
            error: `Invalid style: ${request.style}`,
            code: 'INVALID_STYLE',
          },
        },
        400
      );
    }

    const overallStartTime = Date.now();
    let script: Script | undefined;
    let scriptContent: string;

    // Step 1: Generate or use existing script
    if (request.idea) {
      console.log('📝 Step 1: Generating script from idea...');
      const scriptStartTime = Date.now();

      script = await generateScript({
        idea: request.idea,
        genre: request.genre,
        tone: request.tone,
        length: 'short',
      });

      scriptContent = script.content;

      const scriptTime = Date.now() - scriptStartTime;
      console.log(`✅ Script generated in ${scriptTime}ms`);
    } else if (request.script) {
      console.log('📝 Step 1: Using provided script...');
      scriptContent = request.script;
      console.log('✅ Script ready');
    } else {
      throw new Error('Either "idea" or "script" must be provided');
    }

    // Step 2: Create storyboard structure
    console.log('\n📋 Step 2: Creating storyboard structure...');
    const storyboardStartTime = Date.now();

    const storyboard = await createStoryboardFromScript(
      scriptContent,
      request.numberOfImages,
      request.style,
      request.title
    );

    const storyboardTime = Date.now() - storyboardStartTime;
    console.log(`✅ Storyboard structure created in ${storyboardTime}ms`);

    // Step 3: Generate images
    console.log('\n🖼️ Step 3: Generating images...');
    const imageStartTime = Date.now();

    const result = await generateStoryboardImages(
      storyboard,
      request.style
    );

    const imageTime = Date.now() - imageStartTime;
    console.log(`✅ Images generated in ${imageTime}ms`);

    const totalTime = Date.now() - overallStartTime;

    console.log('\n✅ Complete storyboard generation finished!');
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log(`  - Script: ${script ? scriptTime : 0}ms`);
    console.log(`  - Storyboard: ${storyboardTime}ms`);
    console.log(`  - Images: ${imageTime}ms`);
    console.log('='.repeat(80) + '\n');

    return c.json({
      success: true,
      data: {
        script: script,
        storyboard: result.storyboard,
        generationTime: totalTime,
      },
      meta: {
        breakdown: {
          scriptGeneration: script ? scriptTime : 0,
          storyboardCreation: storyboardTime,
          imageGeneration: imageTime,
          total: totalTime,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in complete storyboard generation:', error);

    return c.json(
      {
        success: false,
        error: formatError(error, 'STORYBOOK_GENERATION_ERROR'),
      },
      500
    );
  }
});
