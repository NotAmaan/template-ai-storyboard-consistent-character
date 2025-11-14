/**
 * Script Generation Service
 *
 * Wraps the Mastra script generator agent for use in HTTP services
 */

import { scriptGeneratorAgent } from '../../../src/mastra/agents/script-generator-agent.js';
import { RuntimeContext } from '@mastra/core/runtime-context';
import type { ScriptGenerationRequest, Script } from '../schemas/index.js';

/**
 * Generate a script from a story idea using the Mastra agent
 */
export async function generateScript(request: ScriptGenerationRequest): Promise<Script> {
  console.log('📝 [Script Generator] Starting script generation...');
  console.log('📋 [Script Generator] Request parameters:', {
    idea: request.idea.substring(0, 50) + '...',
    genre: request.genre,
    length: request.length,
    tone: request.tone,
  });

  const startTime = Date.now();

  try {
    // Create runtime context for the agent
    const runtimeContext = new RuntimeContext();

    // Build the prompt for the agent
    let prompt = `Generate a ${request.length} screenplay based on this idea: ${request.idea}`;

    if (request.genre) {
      prompt += `\nGenre: ${request.genre}`;
    }

    if (request.tone) {
      prompt += `\nTone: ${request.tone}`;
    }

    if (request.targetAudience) {
      prompt += `\nTarget Audience: ${request.targetAudience}`;
    }

    if (request.characters && request.characters.length > 0) {
      prompt += '\n\nCharacters to include:';
      request.characters.forEach(char => {
        prompt += `\n- ${char.name}: ${char.description}`;
        if (char.role) {
          prompt += ` (${char.role})`;
        }
      });
    }

    if (request.settings && request.settings.length > 0) {
      prompt += '\n\nSettings/Locations: ' + request.settings.join(', ');
    }

    prompt += '\n\nReturn the result in the specified JSON format with title, genre, logline, characters, and scenes.';

    console.log('🤖 [Script Generator] Calling script generator agent...');
    console.log('📝 [Script Generator] Prompt length:', prompt.length, 'characters');

    // Call the agent
    const result = await scriptGeneratorAgent.generate(prompt, { runtimeContext });

    console.log('✅ [Script Generator] Agent response received');

    // Parse the response
    let scriptData: any;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = result.text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the whole response as JSON
        scriptData = JSON.parse(result.text);
      }
    } catch (parseError) {
      console.error('❌ [Script Generator] Failed to parse agent response as JSON');
      console.error('Response text:', result.text.substring(0, 500));
      throw new Error('Failed to parse script generation response: ' + (parseError instanceof Error ? parseError.message : 'Unknown error'));
    }

    // Transform agent response to Script schema format
    const script: Script = {
      title: scriptData.title || 'Untitled Script',
      author: request.characters?.[0]?.name || 'AI Generated',
      version: '1.0',
      date: new Date().toISOString().split('T')[0],
      content: formatScriptContent(scriptData),
      characters: transformCharacters(scriptData.characters || []),
      scenes: transformScenes(scriptData.scenes || []),
      structure: {
        totalScenes: scriptData.scenes?.length || 0,
        totalCharacters: scriptData.characters?.length || 0,
        totalDialogue: calculateTotalDialogue(scriptData.scenes || []),
        estimatedDuration: estimateScriptDuration(scriptData.scenes?.length || 0),
        genre: scriptData.genre || request.genre,
        themes: extractThemes(scriptData),
        targetAudience: request.targetAudience,
      },
      metadata: {
        wordCount: countWords(scriptData),
        pageCount: Math.ceil((scriptData.scenes?.length || 0) / 2),
        language: 'en',
        notes: `Generated from idea: ${request.idea.substring(0, 100)}`,
      },
    };

    const generationTime = Date.now() - startTime;
    console.log(`✅ [Script Generator] Script generated successfully in ${generationTime}ms`);
    console.log(`📊 [Script Generator] Stats:`, {
      scenes: script.structure.totalScenes,
      characters: script.structure.totalCharacters,
      duration: script.structure.estimatedDuration,
    });

    return script;
  } catch (error) {
    console.error('❌ [Script Generator] Error during script generation:', error);
    throw error;
  }
}

/**
 * Format script content from agent data
 */
function formatScriptContent(scriptData: any): string {
  let content = `${scriptData.title || 'UNTITLED'}\n\n`;

  if (scriptData.logline) {
    content += `LOGLINE: ${scriptData.logline}\n\n`;
  }

  if (scriptData.scenes && Array.isArray(scriptData.scenes)) {
    scriptData.scenes.forEach((scene: any, index: number) => {
      const sceneNumber = scene.sceneNumber || index + 1;
      content += `SCENE ${sceneNumber}\n\n`;

      if (scene.location) {
        const timeOfDay = scene.timeOfDay || 'DAY';
        content += `${scene.location} - ${timeOfDay}\n\n`;
      }

      if (scene.description) {
        content += `${scene.description}\n\n`;
      }

      if (scene.dialogue) {
        content += `${scene.dialogue}\n\n`;
      }

      content += '\n';
    });
  }

  return content;
}

/**
 * Transform agent characters to Script schema format
 */
function transformCharacters(agentCharacters: any[]): any[] {
  return agentCharacters.map((char: any) => ({
    name: char.name || 'Unknown',
    description: char.description || '',
    role: char.role?.toLowerCase() || 'supporting',
  }));
}

/**
 * Transform agent scenes to Script schema format
 */
function transformScenes(agentScenes: any[]): any[] {
  return agentScenes.map((scene: any, index: number) => ({
    number: scene.sceneNumber || index + 1,
    heading: `${scene.location || 'INT. LOCATION'} - ${scene.timeOfDay || 'DAY'}`,
    location: scene.location || 'Unknown Location',
    timeOfDay: scene.timeOfDay || 'DAY',
    characters: [], // Extract from dialogue if needed
    action: scene.description || '',
    dialogue: parseDialogue(scene.dialogue || ''),
  }));
}

/**
 * Parse dialogue text into structured format
 */
function parseDialogue(dialogueText: string): any[] {
  const dialogues = [];
  const lines = dialogueText.split('\n');

  let currentCharacter = '';
  let currentText = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase() === trimmed && trimmed.length > 0 && !trimmed.includes(':')) {
      // Character name
      if (currentCharacter && currentText) {
        dialogues.push({ character: currentCharacter, text: currentText.trim() });
      }
      currentCharacter = trimmed;
      currentText = '';
    } else if (trimmed) {
      currentText += trimmed + ' ';
    }
  }

  if (currentCharacter && currentText) {
    dialogues.push({ character: currentCharacter, text: currentText.trim() });
  }

  return dialogues;
}

/**
 * Calculate total dialogue exchanges
 */
function calculateTotalDialogue(scenes: any[]): number {
  return scenes.reduce((total, scene) => {
    if (scene.dialogue) {
      return total + (typeof scene.dialogue === 'string' ? 1 : scene.dialogue.length);
    }
    return total;
  }, 0);
}

/**
 * Estimate script duration based on scene count
 */
function estimateScriptDuration(sceneCount: number): string {
  const minutes = sceneCount * 2; // Roughly 2 minutes per scene
  const min = Math.max(10, minutes - 5);
  const max = minutes + 5;
  return `${min}-${max} minutes`;
}

/**
 * Extract themes from script data
 */
function extractThemes(scriptData: any): string[] {
  // Simple theme extraction - in production, you'd use NLP
  const themes: string[] = [];
  const text = JSON.stringify(scriptData).toLowerCase();

  const themeKeywords = {
    'love': ['love', 'romance', 'heart'],
    'adventure': ['adventure', 'journey', 'quest'],
    'courage': ['courage', 'brave', 'heroic'],
    'friendship': ['friend', 'companion', 'bond'],
    'betrayal': ['betray', 'deceive', 'trust'],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      themes.push(theme);
    }
  }

  return themes.slice(0, 3); // Return max 3 themes
}

/**
 * Count words in script data
 */
function countWords(scriptData: any): number {
  const text = JSON.stringify(scriptData);
  return text.split(/\s+/).length;
}
