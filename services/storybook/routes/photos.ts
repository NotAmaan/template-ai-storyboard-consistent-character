/**
 * POST /storybook/photos
 *
 * Generate images for storyboard scenes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { PhotoGenerationRequestSchema } from '../schemas/index.js';
import { generateStoryboardImages } from '../lib/image-generator.js';
import { formatError, isValidStyle } from '../lib/utils.js';
import { logRequest, logError, logResponse } from '../lib/logger.js';

export const photosRoute = new Hono();

/**
 * POST /storybook/photos
 * Generate images for storyboard scenes
 */
photosRoute.post('/', zValidator('json', PhotoGenerationRequestSchema), async (c) => {
  const startTime = Date.now();
  const request = c.req.valid('json');

  // Log request
  logRequest('/storybook/photos', 'POST', {
    style: request.style,
    sceneCount: request.storyboard.scenes.length
  });

  try {
    console.log('\n' + '='.repeat(80));
    console.log('🖼️ POST /storybook/photos - Photo Generation Request');
    console.log('='.repeat(80));

    // Validate style
    if (!isValidStyle(request.style)) {
      logResponse('/storybook/photos', false, Date.now() - startTime);
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

    // Generate images for the storyboard
    const result = await generateStoryboardImages(
      request.storyboard,
      request.style,
      request.sceneNumbers
    );

    const totalTime = Date.now() - startTime;

    console.log('✅ Photo generation completed successfully');
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log('='.repeat(80) + '\n');

    // Log successful generation
    logResponse('/storybook/photos', true, totalTime, {
      imagesGenerated: result.generatedCount,
      style: request.style
    });

    return c.json({
      success: true,
      data: {
        storyboard: result.storyboard,
        generatedImages: result.generatedCount,
        style: request.style,
        generationTime: result.generationTime,
      },
      meta: {
        totalTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Error in photo generation endpoint:', error);

    // Log error
    logError('/storybook/photos', error, { style: request.style });
    logResponse('/storybook/photos', false, totalTime);

    return c.json(
      {
        success: false,
        error: formatError(error, 'PHOTO_GENERATION_ERROR'),
      },
      500
    );
  }
});
