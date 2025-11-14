/**
 * Utility functions for storybook services
 */

/**
 * Available visual styles for storyboard generation
 */
export const AVAILABLE_STYLES = [
  'Cinematic',
  'Photographic',
  'Anime',
  'Manga',
  'Ghibli-esque',
  'Disney-esque',
  'Comic Book',
  'Graphic Novel',
  'Watercolor',
  'Low Poly',
  'Pixel Art',
  'Steampunk',
  'Cyberpunk',
  'Fantasy Art',
  'Film Noir',
];

/**
 * Style descriptions with visual characteristics
 */
export const STYLE_DESCRIPTIONS: Record<string, string> = {
  'Cinematic': 'Professional film still with photorealistic quality and cinematic lighting',
  'Photographic': 'High-quality photograph with natural lighting and realistic details',
  'Anime': 'Vibrant anime style with cel-shaded characters and detailed backgrounds',
  'Manga': 'Black and white manga panel with screentones and dynamic line work',
  'Ghibli-esque': 'Whimsical hand-drawn animation style with soft color palettes',
  'Disney-esque': 'Classic Disney animation with expressive characters and vibrant colors',
  'Comic Book': 'American comic book art with bold outlines and halftone dots',
  'Graphic Novel': 'Mature graphic novel style with atmospheric lighting and moody colors',
  'Watercolor': 'Beautiful watercolor painting with soft edges and vibrant washes',
  'Low Poly': '3D low poly render with geometric shapes and simple color palette',
  'Pixel Art': '16-bit pixel art with nostalgic retro video game aesthetic',
  'Steampunk': 'Victorian steampunk style with brass details and mechanical elements',
  'Cyberpunk': 'Neon-drenched cyberpunk cityscape with high-tech low-life aesthetic',
  'Fantasy Art': 'Epic fantasy art with dramatic lighting and magical atmosphere',
  'Film Noir': 'Black and white film noir with high contrast and dramatic shadows',
};

/**
 * Style prompts with prefix and suffix for image generation
 */
export const STYLE_PROMPTS: Record<string, { prefix: string; suffix: string }> = {
  'Cinematic': {
    prefix: 'Cinematic film still, photorealistic,',
    suffix: ', 4k, hyper-detailed, professional color grading, sharp focus'
  },
  'Photographic': {
    prefix: 'Professional photograph, photorealistic,',
    suffix: ', 85mm lens, sharp focus, high quality photo'
  },
  'Anime': {
    prefix: 'Vibrant anime style, key visual,',
    suffix: ', cel-shaded, detailed characters, trending on Pixiv, by Makoto Shinkai'
  },
  'Manga': {
    prefix: 'Black and white manga panel,',
    suffix: ', screentones, sharp lines, detailed ink work, dynamic action'
  },
  'Ghibli-esque': {
    prefix: 'Ghibli-esque animation style,',
    suffix: ', beautiful hand-drawn background, whimsical, soft color palette'
  },
  'Disney-esque': {
    prefix: 'Classic Disney animation style,',
    suffix: ', expressive characters, vibrant colors, storybook illustration'
  },
  'Comic Book': {
    prefix: 'American comic book art style,',
    suffix: ', bold outlines, vibrant colors, halftone dots, action-packed'
  },
  'Graphic Novel': {
    prefix: 'Mature graphic novel art style,',
    suffix: ', detailed inks, atmospheric lighting, moody colors'
  },
  'Watercolor': {
    prefix: 'Beautiful watercolor painting,',
    suffix: ', soft edges, vibrant washes of color, on textured paper'
  },
  'Low Poly': {
    prefix: 'Low poly 3D render,',
    suffix: ', geometric shapes, simple color palette, isometric view'
  },
  'Pixel Art': {
    prefix: 'Detailed pixel art, 16-bit,',
    suffix: ', vibrant color palette, nostalgic retro video game style'
  },
  'Steampunk': {
    prefix: 'Steampunk style illustration,',
    suffix: ', intricate gears and cogs, brass and copper details, Victorian aesthetic'
  },
  'Cyberpunk': {
    prefix: 'Cyberpunk cityscape,',
    suffix: ', neon-drenched, high-tech low-life, Blade Runner aesthetic, moody lighting'
  },
  'Fantasy Art': {
    prefix: 'Epic fantasy art, D&D style,',
    suffix: ', dramatic lighting, detailed armor and landscapes, magical atmosphere'
  },
  'Film Noir': {
    prefix: 'Black and white film noir style,',
    suffix: ', high contrast, dramatic shadows, 1940s detective movie aesthetic'
  },
};

/**
 * Validate if a style name is supported
 */
export function isValidStyle(style: string): boolean {
  return AVAILABLE_STYLES.includes(style);
}

/**
 * Get style configuration for image generation
 */
export function getStyleConfig(style: string): { prefix: string; suffix: string } {
  return STYLE_PROMPTS[style] || STYLE_PROMPTS['Cinematic'];
}

/**
 * Get style description
 */
export function getStyleDescription(style: string): string {
  return STYLE_DESCRIPTIONS[style] || 'Professional visual style';
}

/**
 * Get all styles with metadata
 */
export function getAllStyles() {
  return AVAILABLE_STYLES.map(style => ({
    name: style,
    description: getStyleDescription(style),
    recommended: ['Cinematic', 'Anime', 'Ghibli-esque', 'Comic Book'].includes(style),
  }));
}

/**
 * Format error response
 */
export function formatError(error: unknown, code?: string) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return {
    error: message,
    code: code || 'INTERNAL_ERROR',
    details: error instanceof Error ? error.stack : undefined,
  };
}

/**
 * Generate timestamp for file naming
 */
export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50)
    .toLowerCase();
}

/**
 * Calculate estimated generation time based on parameters
 */
export function estimateGenerationTime(params: {
  numberOfScenes: number;
  hasScript: boolean;
  quality: 'standard' | 'high';
}): number {
  const baseTime = params.hasScript ? 10000 : 30000; // 10s or 30s
  const sceneTime = params.quality === 'high' ? 8000 : 5000; // per scene
  return baseTime + (params.numberOfScenes * sceneTime);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Parse script content to extract scenes
 */
export function parseScriptScenes(scriptContent: string): Array<{ number: number; heading: string; content: string }> {
  const scenes: Array<{ number: number; heading: string; content: string }> = [];
  const lines = scriptContent.split('\n');

  let currentScene: { number: number; heading: string; content: string } | null = null;
  let sceneNumber = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a scene heading (starts with INT. or EXT.)
    if (trimmed.match(/^(INT\.|EXT\.)/i)) {
      if (currentScene) {
        scenes.push(currentScene);
      }
      sceneNumber++;
      currentScene = {
        number: sceneNumber,
        heading: trimmed,
        content: '',
      };
    } else if (currentScene && trimmed) {
      currentScene.content += line + '\n';
    }
  }

  // Add the last scene
  if (currentScene) {
    scenes.push(currentScene);
  }

  return scenes;
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['GOOGLE_GENERATIVE_AI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create a delay promise (for rate limiting)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
