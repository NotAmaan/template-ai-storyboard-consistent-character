# Storybook Services

A modular, fully-typed HTTP service for AI-powered script generation and storyboard image creation. Built with Hono, Zod, and Google Generative AI.

## Overview

This service extracts and exposes the core storyboard generation capabilities as standalone HTTP endpoints. It can be used independently or integrated into larger applications.

### Features

- **Script Generation**: Transform story ideas into complete, structured screenplays
- **Image Generation**: Create visual storyboards with multiple artistic styles
- **Combined Generation**: One-stop endpoint for complete storybook creation
- **Modular Architecture**: Each service can work independently or together
- **Type Safety**: Full TypeScript support with Zod validation
- **Well Documented**: Comprehensive API documentation and examples

### Technology Stack

- **[Hono](https://hono.dev/)**: Ultra-fast web framework for TypeScript
- **[Zod](https://zod.dev/)**: Runtime type validation and transformation
- **Google Generative AI**: Powered by Gemini and Imagen models
- **Mastra**: Agent orchestration and workflow management

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_GENERATIVE_AI_API_KEY
```

## Usage

### Starting the Server

```bash
# Development mode with auto-reload
npm run services:dev

# Production mode
npm run services:start
```

The server will start on `http://localhost:3000` by default (configurable via `PORT` environment variable).

### Interactive Web UI

Once the server is running, open your browser and navigate to:

**http://localhost:3000/**

The UI provides:
- 📝 **Script Generation**: Generate screenplays from story ideas
- 🖼️ **Image Generation**: Create images for storyboard scenes
- 🎬 **Complete Storybook**: One-click generation of script + images
- 🎨 **Style Browser**: Explore all 15 available visual styles
- ✅ **Real-time Preview**: See generated images and JSON responses immediately

The UI is a single-page application with tabs for each service, form validation, loading states, and beautiful image previews.

## API Endpoints

### 1. Generate Script

Generate a screenplay from a story idea.

**Endpoint**: `POST /storybook/script`

**Request Body**:
```json
{
  "idea": "A young inventor builds a flying machine to cross a vast canyon",
  "genre": "adventure",
  "length": "short",
  "tone": "dramatic",
  "targetAudience": "family"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "The Canyon Crossing",
    "author": "AI Generated",
    "content": "...",
    "characters": [...],
    "scenes": [...],
    "structure": {
      "totalScenes": 5,
      "totalCharacters": 3,
      "estimatedDuration": "15-20 minutes"
    }
  },
  "meta": {
    "generationTime": 15234,
    "timestamp": "2025-01-14T08:00:00.000Z"
  }
}
```

### 2. Generate Images

Generate images for existing storyboard scenes.

**Endpoint**: `POST /storybook/photos`

**Request Body**:
```json
{
  "storyboard": {
    "characters": [...],
    "scenes": [...],
    "metadata": {...}
  },
  "style": "Cinematic",
  "quality": "standard",
  "aspectRatio": "16:9",
  "sceneNumbers": [1, 2, 3]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "storyboard": {
      "characters": [...],
      "scenes": [
        {
          "sceneNumber": 1,
          "imagePrompt": "...",
          "imagePath": "scene_1_canyon_edge_1234567890.png",
          "imageUrl": "data:image/jpeg;base64,..."
        }
      ]
    },
    "generatedImages": 3,
    "style": "Cinematic",
    "generationTime": 24561
  }
}
```

### 3. Generate Complete Storybook

Generate script and images in one request.

**Endpoint**: `POST /storybooks`

**Request Body**:
```json
{
  "idea": "A detective solves a mystery in a cyberpunk city",
  "numberOfImages": 5,
  "style": "Cyberpunk",
  "title": "Neon Nights",
  "genre": "mystery",
  "tone": "thriller"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "script": {...},
    "storyboard": {...},
    "generationTime": 45678
  },
  "meta": {
    "breakdown": {
      "scriptGeneration": 15234,
      "storyboardCreation": 12345,
      "imageGeneration": 18099,
      "total": 45678
    }
  }
}
```

### 4. Get Available Styles

List all available visual styles.

**Endpoint**: `GET /storybook/styles`

**Response**:
```json
{
  "success": true,
  "data": {
    "styles": [
      {
        "name": "Cinematic",
        "description": "Professional film still with photorealistic quality",
        "recommended": true
      },
      {
        "name": "Anime",
        "description": "Vibrant anime style with cel-shaded characters",
        "recommended": true
      }
    ],
    "total": 15
  }
}
```

### 5. Get Style Details

Get information about a specific style.

**Endpoint**: `GET /storybook/styles/:name`

**Example**: `GET /storybook/styles/Cinematic`

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "Cinematic",
    "description": "Professional film still with photorealistic quality",
    "recommended": true
  }
}
```

## Available Visual Styles

- **Cinematic**: Professional film still with photorealistic quality
- **Photographic**: High-quality photograph with natural lighting
- **Anime**: Vibrant anime style with cel-shaded characters
- **Manga**: Black and white manga panel with screentones
- **Ghibli-esque**: Whimsical hand-drawn animation style
- **Disney-esque**: Classic Disney animation with expressive characters
- **Comic Book**: American comic book art with bold outlines
- **Graphic Novel**: Mature graphic novel style with atmospheric lighting
- **Watercolor**: Beautiful watercolor painting with soft edges
- **Low Poly**: 3D low poly render with geometric shapes
- **Pixel Art**: 16-bit pixel art with retro video game style
- **Steampunk**: Victorian steampunk style with brass details
- **Cyberpunk**: Neon-drenched cyberpunk cityscape
- **Fantasy Art**: Epic fantasy art with dramatic lighting
- **Film Noir**: Black and white film noir with high contrast

## Request Validation

All endpoints use Zod for request validation. Invalid requests will return a 400 error with detailed validation messages:

```json
{
  "success": false,
  "error": {
    "error": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": [...]
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {...}
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid request data
- `SCRIPT_GENERATION_ERROR`: Script generation failed
- `PHOTO_GENERATION_ERROR`: Image generation failed
- `STORYBOOK_GENERATION_ERROR`: Complete storybook generation failed
- `INVALID_STYLE`: Unsupported visual style
- `INTERNAL_ERROR`: Unexpected server error

## Environment Variables

Required:
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Generative AI API key

Optional:
- `PORT`: Server port (default: 3000)

## Architecture

```
services/storybook/
├── index.ts                 # Main Hono app and server
├── schemas/
│   └── index.ts            # Zod schemas for validation
├── routes/
│   ├── script.ts           # POST /storybook/script
│   ├── photos.ts           # POST /storybook/photos
│   ├── storybooks.ts       # POST /storybooks
│   └── styles.ts           # GET /storybook/styles
├── lib/
│   ├── script-generator.ts # Script generation logic
│   ├── image-generator.ts  # Image generation logic
│   └── utils.ts            # Utility functions
└── README.md               # This file
```

## Output Format

The service maintains compatibility with the original Mastra implementation:

- **Scripts**: Structured with title, characters, scenes, and metadata
- **Storyboards**: Include character anchors, scene details, and image prompts
- **Images**: Saved to `generated-images/` directory with timestamped filenames

## Examples

### cURL Examples

**Generate a script:**
```bash
curl -X POST http://localhost:3000/storybook/script \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A robot learns to feel emotions",
    "genre": "sci-fi",
    "tone": "dramatic",
    "length": "short"
  }'
```

**Generate complete storybook:**
```bash
curl -X POST http://localhost:3000/storybooks \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A magical library where books come to life",
    "numberOfImages": 5,
    "style": "Fantasy Art",
    "title": "The Living Library"
  }'
```

**Get available styles:**
```bash
curl http://localhost:3000/storybook/styles
```

### JavaScript/TypeScript Example

```typescript
import type { ScriptGenerationRequest } from './schemas';

async function generateStorybook() {
  const response = await fetch('http://localhost:3000/storybooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idea: 'A time traveler prevents a historical disaster',
      numberOfImages: 6,
      style: 'Cinematic',
      title: 'Temporal Paradox',
      genre: 'sci-fi',
      tone: 'thriller',
    }),
  });

  const result = await response.json();
  console.log('Generated storybook:', result.data);
}
```

## Development

### Project Structure

Each module is fully independent and can be used separately:

- **schemas**: Zod validation schemas
- **routes**: HTTP route handlers
- **lib**: Core business logic (can be imported and used without HTTP layer)

### Adding New Endpoints

1. Create schema in `schemas/index.ts`
2. Add business logic to `lib/`
3. Create route handler in `routes/`
4. Register route in `index.ts`

### Testing

```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/
```

## License

MIT

## Credits

Built on top of the [Mastra AI Storyboard Template](https://github.com/mastra-ai/template-ai-storyboard-consistent-character).
