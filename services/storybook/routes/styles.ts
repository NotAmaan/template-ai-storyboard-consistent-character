/**
 * GET /storybook/styles
 *
 * Get available visual styles for storyboard generation
 */

import { Hono } from 'hono';
import { getAllStyles } from '../lib/utils.js';

export const stylesRoute = new Hono();

/**
 * GET /storybook/styles
 * Get all available visual styles with descriptions
 */
stylesRoute.get('/', async (c) => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🎨 GET /storybook/styles - Styles List Request');
    console.log('='.repeat(80));

    const styles = getAllStyles();

    console.log(`✅ Returning \${styles.length} available styles`);
    console.log('='.repeat(80) + '\n');

    return c.json({
      success: true,
      data: {
        styles,
        total: styles.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in styles endpoint:', error);

    return c.json(
      {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'STYLES_ERROR',
        },
      },
      500
    );
  }
});

/**
 * GET /storybook/styles/:name
 * Get details about a specific style
 */
stylesRoute.get('/:name', async (c) => {
  try {
    const styleName = c.req.param('name');
    const styles = getAllStyles();
    const style = styles.find(
      (s) => s.name.toLowerCase() === styleName.toLowerCase()
    );

    if (!style) {
      return c.json(
        {
          success: false,
          error: {
            error: `Style not found: ${styleName}`,
            code: 'STYLE_NOT_FOUND',
          },
        },
        404
      );
    }

    return c.json({
      success: true,
      data: style,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in style detail endpoint:', error);

    return c.json(
      {
        success: false,
        error: {
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'STYLE_DETAIL_ERROR',
        },
      },
      500
    );
  }
});
