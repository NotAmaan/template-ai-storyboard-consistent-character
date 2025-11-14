/**
 * Logger Utility
 *
 * Handles logging of requests, responses, errors, and generated content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../..');
const logsDir = path.join(projectRoot, 'logs');
const storiesDir = path.join(logsDir, 'stories');
const errorsDir = path.join(logsDir, 'errors');
const requestsFile = path.join(logsDir, 'requests.log');

// Ensure directories exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}
if (!fs.existsSync(errorsDir)) {
  fs.mkdirSync(errorsDir, { recursive: true });
}

/**
 * Format timestamp for logs
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate safe filename from text
 */
function sanitizeForFilename(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
    .toLowerCase();
}

/**
 * Log request
 */
export function logRequest(endpoint: string, method: string, body?: any) {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    endpoint,
    method,
    body: body ? JSON.stringify(body).substring(0, 200) : undefined,
  };

  const logLine = `[${timestamp}] ${method} ${endpoint}\n`;

  try {
    fs.appendFileSync(requestsFile, logLine);
  } catch (error) {
    console.error('Failed to write request log:', error);
  }
}

/**
 * Log error
 */
export function logError(endpoint: string, error: any, context?: any) {
  const timestamp = getTimestamp();
  const errorFilename = `error_${sanitizeForFilename(endpoint)}_${Date.now()}.json`;
  const errorPath = path.join(errorsDir, errorFilename);

  const errorData = {
    timestamp,
    endpoint,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context: context || {},
  };

  try {
    fs.writeFileSync(errorPath, JSON.stringify(errorData, null, 2));

    // Also append to errors.log
    const errorLogLine = `[${timestamp}] ERROR in ${endpoint}: ${errorData.error.message}\n`;
    fs.appendFileSync(path.join(logsDir, 'errors.log'), errorLogLine);
  } catch (err) {
    console.error('Failed to write error log:', err);
  }
}

/**
 * Log generated story/script
 */
export function logStory(type: 'script' | 'storyboard' | 'complete', data: any, metadata?: any) {
  const timestamp = getTimestamp();
  const idea = metadata?.idea || 'untitled';
  const safeIdea = sanitizeForFilename(idea);
  const filename = `${type}_${safeIdea}_${Date.now()}.json`;
  const storyPath = path.join(storiesDir, filename);

  const storyData = {
    timestamp,
    type,
    metadata: metadata || {},
    data,
  };

  try {
    fs.writeFileSync(storyPath, JSON.stringify(storyData, null, 2));
    console.log(`📝 Story logged: ${filename}`);
  } catch (error) {
    console.error('Failed to write story log:', error);
  }
}

/**
 * Log response summary
 */
export function logResponse(endpoint: string, success: boolean, duration: number, metadata?: any) {
  const timestamp = getTimestamp();
  const logLine = `[${timestamp}] ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)\n`;

  try {
    fs.appendFileSync(requestsFile, logLine);
  } catch (error) {
    console.error('Failed to write response log:', error);
  }
}

/**
 * Get log statistics
 */
export function getLogStats() {
  try {
    const storiesCount = fs.readdirSync(storiesDir).length;
    const errorsCount = fs.readdirSync(errorsDir).length;

    let requestsCount = 0;
    if (fs.existsSync(requestsFile)) {
      const content = fs.readFileSync(requestsFile, 'utf-8');
      requestsCount = content.split('\n').filter(line => line.includes('POST') || line.includes('GET')).length;
    }

    return {
      totalRequests: requestsCount,
      totalStories: storiesCount,
      totalErrors: errorsCount,
    };
  } catch (error) {
    console.error('Failed to get log stats:', error);
    return {
      totalRequests: 0,
      totalStories: 0,
      totalErrors: 0,
    };
  }
}
