/**
 * Image Generation Service
 *
 * Handles image generation using Google Imagen API (via existing Mastra tools)
 */

import { GoogleGenAI } from '@google/genai';
import {
  getStyleConfig,
  generateTimestamp,
  sanitizeFilename,
} from './utils.js';
import type { StoryboardData, StoryboardScene } from '../schemas/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a single image using Google Imagen
 */
export async function generateSingleImage(
  prompt: string,
  style: string
): Promise<{ imageData: string; imagePath: string }> {
  console.log('🎨 [Image Generator] Starting image generation...');
  console.log(`📝 [Image Generator] Prompt: ${prompt.substring(0, 50)}...`);
  console.log(`🎭 [Image Generator] Style: ${style}`);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables'
    );
  }

  const styleConfig = getStyleConfig(style);
  const fullPrompt = `${styleConfig.prefix} ${prompt}${styleConfig.suffix}`;

  console.log(
    `📝 [Image Generator] Full prompt: ${fullPrompt.substring(0, 100)}...`
  );

  const ai = new GoogleGenAI({ apiKey });
  const startTime = Date.now();

  try {
    console.log('🚀 [Image Generator] Calling Google Imagen API...');

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    const generationTime = Date.now() - startTime;
    console.log(
      `✅ [Image Generator] API call completed in ${generationTime}ms`
    );

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images returned from Imagen API');
    }

    const image = response.generatedImages[0].image;
    if (!image || !image.imageBytes) {
      throw new Error('Invalid image data returned from Imagen API');
    }

    const base64ImageBytes: string = image.imageBytes;
    const imageData = `data:image/jpeg;base64,${base64ImageBytes}`;

    console.log(
      `📊 [Image Generator] Image data size: ${base64ImageBytes.length} characters`
    );

    // Save image locally
    const imagePath = await saveImageLocally(imageData, prompt);

    console.log(`✅ [Image Generator] Image generated and saved: ${imagePath}`);

    return { imageData, imagePath };
  } catch (error) {
    console.error('❌ [Image Generator] Error during image generation:', error);
    throw error;
  }
}

/**
 * Save image data to local file system
 */
async function saveImageLocally(
  imageData: string,
  prompt: string
): Promise<string> {
  console.log('💾 [Image Save] Saving image to disk...');

  try {
    // Create filename from prompt and timestamp
    const sanitizedPrompt = sanitizeFilename(prompt);
    const timestamp = Date.now();
    const timestampISO = generateTimestamp();
    const filename = `scene_${sanitizedPrompt}_${timestamp}_${timestampISO}.png`;

    console.log(`📄 [Image Save] Filename: ${filename}`);

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`📊 [Image Save] Buffer size: ${buffer.length} bytes`);

    // Ensure output directory exists
    const projectRoot = path.resolve(__dirname, '../../..');
    const outputDir = path.join(projectRoot, 'generated-images');

    if (!fs.existsSync(outputDir)) {
      console.log(`📁 [Image Save] Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ [Image Save] Image saved: ${filename}`);

    return filename;
  } catch (error) {
    console.error('❌ [Image Save] Error saving image:', error);
    throw new Error(
      `Failed to save image: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Generate images for all scenes in a storyboard
 */
export async function generateStoryboardImages(
  storyboard: StoryboardData,
  style: string,
  sceneNumbers?: number[]
): Promise<{
  storyboard: StoryboardData;
  generatedCount: number;
  generationTime: number;
}> {
  console.log('🎬 [Image Generator] Starting storyboard image generation...');
  console.log(`📊 [Image Generator] Total scenes: ${storyboard.scenes.length}`);
  console.log(`🎭 [Image Generator] Style: ${style}`);

  if (sceneNumbers) {
    console.log(
      `🔢 [Image Generator] Generating for scenes: ${sceneNumbers.join(', ')}`
    );
  }

  const startTime = Date.now();
  let generatedCount = 0;

  // Create a copy of the storyboard to modify
  const updatedStoryboard: StoryboardData = JSON.parse(
    JSON.stringify(storyboard)
  );

  try {
    for (const scene of updatedStoryboard.scenes) {
      // Skip if scene numbers are specified and this scene is not in the list
      if (sceneNumbers && !sceneNumbers.includes(scene.sceneNumber)) {
        console.log(`⏭️ [Image Generator] Skipping scene ${scene.sceneNumber}`);
        continue;
      }

      // Skip if scene already has an image
      if (scene.imagePath || scene.imageUrl) {
        console.log(
          `⏭️ [Image Generator] Scene ${scene.sceneNumber} already has an image`
        );
        continue;
      }

      console.log(
        `\n🖼️ [Image Generator] Generating image for scene ${scene.sceneNumber}...`
      );

      try {
        const { imageData, imagePath } = await generateSingleImage(
          scene.imagePrompt,
          style
        );

        // Update scene with image path
        scene.imagePath = imagePath;
        scene.imageUrl = imageData;

        generatedCount++;
        console.log(`✅ [Image Generator] Scene ${scene.sceneNumber} complete`);

        // Add a small delay to avoid rate limiting
        if (generatedCount < updatedStoryboard.scenes.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(
          `❌ [Image Generator] Failed to generate image for scene ${scene.sceneNumber}:`,
          error
        );
        // Continue with other scenes even if one fails
        scene.imagePath = 'error';
        scene.imageUrl = '';
      }
    }

    const totalTime = Date.now() - startTime;

    console.log(`\n🎉 [Image Generator] Storyboard image generation complete!`);
    console.log(
      `📊 [Image Generator] Generated ${generatedCount} images in ${totalTime}ms`
    );

    return {
      storyboard: updatedStoryboard,
      generatedCount,
      generationTime: totalTime,
    };
  } catch (error) {
    console.error(
      '❌ [Image Generator] Error during storyboard image generation:',
      error
    );
    throw error;
  }
}

/**
 * Create a storyboard structure from a script
 */
export async function createStoryboardFromScript(
  script: string,
  numberOfImages: number,
  style: string,
  title?: string
): Promise<StoryboardData> {
  console.log('📋 [Storyboard Creator] Creating storyboard from script...');
  console.log(`📊 [Storyboard Creator] Target images: ${numberOfImages}`);

  // Use the storyboard agent to create the structure
  const { storyboardAgent } = await import(
    '../../../src/mastra/agents/storyboard-agent.js'
  );
  const { RuntimeContext } = await import('@mastra/core/runtime-context');

  const runtimeContext = new RuntimeContext();

  const prompt = `Create a storyboard with ${numberOfImages} key visual moments from this script:\n\n${script}\n\nGenerate detailed image prompts for each scene that will work well in ${style} style.`;

  console.log('🤖 [Storyboard Creator] Calling storyboard agent...');

  const result = await storyboardAgent.generate(prompt, { runtimeContext });

  console.log('✅ [Storyboard Creator] Agent response received');

  // Parse the response
  let storyboardData: any;
  try {
    const jsonMatch = result.text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      storyboardData = JSON.parse(jsonMatch[1]);
    } else {
      storyboardData = JSON.parse(result.text);
    }
  } catch (parseError) {
    console.error('❌ [Storyboard Creator] Failed to parse agent response');
    throw new Error('Failed to parse storyboard creation response');
  }

  // Transform to StoryboardData schema
  const storyboard: StoryboardData = {
    characters: storyboardData.characters || [],
    scenes: (storyboardData.scenes || []).map((scene: any, index: number) => ({
      sceneNumber: scene.sceneNumber || index + 1,
      scriptChunk: scene.storyContent || scene.scriptChunk || '',
      imagePrompt: scene.imagePrompt || 'A cinematic scene',
      cameraAngle: scene.cameraAngle,
      composition: scene.composition,
      lighting: scene.lighting,
      mood: scene.mood,
      characters: scene.characters || [],
    })),
    metadata: {
      title: title || storyboardData.title || 'Untitled Storyboard',
      creationDate: new Date().toISOString(),
      totalScenes: numberOfImages,
      characterCount: (storyboardData.characters || []).length,
      style: style,
      quality: 'standard',
      aspectRatio: '16:9',
    },
  };

  console.log('✅ [Storyboard Creator] Storyboard structure created');
  console.log(
    `📊 [Storyboard Creator] Scenes: ${storyboard.scenes.length}, Characters: ${storyboard.metadata.characterCount}`
  );

  return storyboard;
}
