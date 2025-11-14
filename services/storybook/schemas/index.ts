/**
 * Zod Schemas for Storybook Services
 *
 * These schemas provide validation and transformation for all API endpoints.
 * They mirror the original Mastra schemas while being optimized for HTTP APIs.
 */

import { z } from 'zod';

// ============================================================================
// Character Schemas
// ============================================================================

/**
 * Character schema for script generation
 */
export const CharacterSchema = z.object({
  name: z.string().min(1).describe('Character name'),
  description: z.string().optional().describe('Character description'),
  firstAppearance: z.string().optional().describe('Scene where character first appears'),
  dialogueCount: z.number().min(0).optional().describe('Number of dialogue lines'),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'extra']).optional().describe('Character role in the story'),
});

/**
 * Character anchor schema for visual consistency in storyboards
 */
export const CharacterAnchorSchema = z.object({
  name: z.string().min(1).describe('Character name'),
  description: z.string().min(10).describe('Detailed visual description for consistency'),
  firstAppearance: z.string().optional().describe('Scene where character first appears'),
  usage: z.string().optional().describe('How the character is used in the storyboard'),
});

// ============================================================================
// Scene Schemas
// ============================================================================

/**
 * Scene schema for scripts
 */
export const SceneSchema = z.object({
  number: z.number().min(1).describe('Scene number'),
  heading: z.string().describe('Scene heading (e.g., "INT. LOCATION - DAY")'),
  location: z.string().describe('Scene location'),
  timeOfDay: z.string().describe('Time of day (DAY, NIGHT, DAWN, DUSK)'),
  characters: z.array(z.string()).describe('Characters present in the scene'),
  action: z.string().describe('Action description'),
  dialogue: z.array(z.object({
    character: z.string(),
    text: z.string(),
    parenthetical: z.string().optional(),
  })).optional().describe('Dialogue in the scene'),
});

/**
 * Storyboard scene schema with image generation details
 */
export const StoryboardSceneSchema = z.object({
  sceneNumber: z.number().min(1).describe('Scene number in the storyboard'),
  scriptChunk: z.string().describe('Relevant script text for this scene'),
  imagePrompt: z.string().min(10).describe('Detailed image generation prompt'),
  imageUrl: z.string().optional().describe('Generated image URL or base64 data'),
  imagePath: z.string().optional().describe('Local path to generated image'),
  cameraAngle: z.enum(['wide', 'medium', 'close-up', 'extreme-close-up', 'bird-eye', 'worm-eye']).optional().describe('Camera angle for the scene'),
  composition: z.string().optional().describe('Composition notes'),
  lighting: z.string().optional().describe('Lighting description'),
  mood: z.string().optional().describe('Emotional mood of the scene'),
  characters: z.array(z.string()).optional().describe('Characters present in this scene'),
});

// ============================================================================
// Script Schemas
// ============================================================================

/**
 * Script structure analysis schema
 */
export const ScriptStructureSchema = z.object({
  totalScenes: z.number().min(1).describe('Total number of scenes'),
  totalCharacters: z.number().min(1).describe('Total number of characters'),
  totalDialogue: z.number().min(0).describe('Total number of dialogue exchanges'),
  estimatedDuration: z.string().describe('Estimated runtime (e.g., "15-20 minutes")'),
  genre: z.string().optional().describe('Script genre'),
  themes: z.array(z.string()).optional().describe('Themes present in the script'),
  targetAudience: z.enum(['family', 'adult', 'teen', 'children']).optional().describe('Target audience'),
});

/**
 * Complete script schema
 */
export const ScriptSchema = z.object({
  title: z.string().min(1).describe('Script title'),
  author: z.string().optional().describe('Script author'),
  version: z.string().optional().describe('Script version'),
  date: z.string().optional().describe('Creation date'),
  content: z.string().min(1).describe('Full script content in standard format'),
  characters: z.array(CharacterSchema).describe('Characters in the script'),
  scenes: z.array(SceneSchema).describe('Scenes in the script'),
  structure: ScriptStructureSchema.describe('Script structure analysis'),
  metadata: z.object({
    wordCount: z.number().min(0).optional(),
    pageCount: z.number().min(0).optional(),
    language: z.string().default('en').optional(),
    rating: z.string().optional(),
    notes: z.string().optional(),
  }).optional().describe('Additional metadata'),
});

// ============================================================================
// Storyboard Schemas
// ============================================================================

/**
 * Storyboard metadata schema
 */
export const StoryboardMetadataSchema = z.object({
  title: z.string().optional().describe('Storyboard title'),
  author: z.string().optional().describe('Storyboard author'),
  creationDate: z.string().describe('Creation date and time'),
  totalScenes: z.number().min(1).describe('Total number of scenes'),
  characterCount: z.number().min(0).describe('Number of characters'),
  style: z.string().describe('Visual style used'),
  quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
  generationTime: z.number().optional().describe('Total generation time in milliseconds'),
  version: z.string().optional().describe('Storyboard version'),
  notes: z.string().optional().describe('Additional notes'),
});

/**
 * Complete storyboard data schema
 */
export const StoryboardDataSchema = z.object({
  characters: z.array(CharacterAnchorSchema).describe('Character anchors for consistency'),
  scenes: z.array(StoryboardSceneSchema).describe('Storyboard scenes'),
  metadata: StoryboardMetadataSchema.describe('Storyboard metadata'),
});

// ============================================================================
// API Request/Response Schemas
// ============================================================================

/**
 * POST /storybook/script - Generate script from idea
 */
export const ScriptGenerationRequestSchema = z.object({
  idea: z.string().min(10).describe('Story idea or concept'),
  genre: z.string().optional().describe('Desired genre'),
  length: z.enum(['short', 'medium', 'long']).default('short').describe('Script length'),
  tone: z.enum(['dramatic', 'comedy', 'thriller', 'romance', 'action', 'mystery', 'sci-fi', 'fantasy']).optional().describe('Desired tone'),
  targetAudience: z.enum(['family', 'adult', 'teen', 'children']).optional().describe('Target audience'),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
    role: z.string().optional(),
  })).optional().describe('Pre-defined characters'),
  settings: z.array(z.string()).optional().describe('Desired settings or locations'),
});

export const ScriptGenerationResponseSchema = ScriptSchema;

/**
 * POST /storybook/photos - Generate images for storyboard
 */
export const PhotoGenerationRequestSchema = z.object({
  storyboard: StoryboardDataSchema.describe('Storyboard data with scenes to generate images for'),
  style: z.string().default('Cinematic').describe('Visual style for images'),
  quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
  sceneNumbers: z.array(z.number()).optional().describe('Specific scene numbers to generate (optional, generates all if not provided)'),
});

export const PhotoGenerationResponseSchema = z.object({
  storyboard: StoryboardDataSchema.describe('Updated storyboard with image paths'),
  generatedImages: z.number().describe('Number of images generated'),
  style: z.string().describe('Style used for generation'),
  generationTime: z.number().describe('Total generation time in milliseconds'),
});

/**
 * POST /storybooks - Generate complete storyboard (script + images)
 */
export const CompleteStoryboardRequestSchema = z.object({
  idea: z.string().min(10).optional().describe('Story idea (for script generation)'),
  script: z.string().min(10).optional().describe('Existing script content'),
  numberOfImages: z.number().min(1).max(12).default(5).describe('Number of key visual moments (1-12)'),
  style: z.string().default('Cinematic').describe('Visual style for the storyboard'),
  quality: z.enum(['standard', 'high']).default('standard').describe('Image quality setting'),
  aspectRatio: z.enum(['1:1', '16:9', '4:3', '3:2']).default('16:9').describe('Image aspect ratio'),
  title: z.string().optional().describe('Optional title for the storyboard'),
  genre: z.string().optional().describe('Genre for script generation'),
  tone: z.enum(['dramatic', 'comedy', 'thriller', 'romance', 'action', 'mystery', 'sci-fi', 'fantasy']).optional().describe('Tone for script generation'),
  characterEmphasis: z.boolean().default(true).describe('Whether to emphasize character consistency'),
}).refine(
  (data) => data.idea || data.script,
  { message: 'Either "idea" or "script" must be provided' }
);

export const CompleteStoryboardResponseSchema = z.object({
  script: ScriptSchema.optional().describe('Generated script (if idea was provided)'),
  storyboard: StoryboardDataSchema.describe('Complete storyboard with images'),
  generationTime: z.number().describe('Total generation time in milliseconds'),
});

/**
 * GET /storybook/styles - Get available visual styles
 */
export const StylesResponseSchema = z.object({
  styles: z.array(z.object({
    name: z.string().describe('Style name'),
    description: z.string().describe('Style description'),
    recommended: z.boolean().optional().describe('Whether this is a recommended style'),
  })).describe('Available visual styles'),
  total: z.number().describe('Total number of styles'),
});

// ============================================================================
// Error Schema
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string().describe('Error message'),
  code: z.string().optional().describe('Error code'),
  details: z.any().optional().describe('Additional error details'),
});

// ============================================================================
// Export Types
// ============================================================================

export type Character = z.infer<typeof CharacterSchema>;
export type CharacterAnchor = z.infer<typeof CharacterAnchorSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>;
export type ScriptStructure = z.infer<typeof ScriptStructureSchema>;
export type Script = z.infer<typeof ScriptSchema>;
export type StoryboardMetadata = z.infer<typeof StoryboardMetadataSchema>;
export type StoryboardData = z.infer<typeof StoryboardDataSchema>;

export type ScriptGenerationRequest = z.infer<typeof ScriptGenerationRequestSchema>;
export type ScriptGenerationResponse = z.infer<typeof ScriptGenerationResponseSchema>;
export type PhotoGenerationRequest = z.infer<typeof PhotoGenerationRequestSchema>;
export type PhotoGenerationResponse = z.infer<typeof PhotoGenerationResponseSchema>;
export type CompleteStoryboardRequest = z.infer<typeof CompleteStoryboardRequestSchema>;
export type CompleteStoryboardResponse = z.infer<typeof CompleteStoryboardResponseSchema>;
export type StylesResponse = z.infer<typeof StylesResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
