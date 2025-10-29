/**
 * Schema loading and caching
 *
 * @module core/schema
 */

import { readFile } from 'fs/promises';
import type { SchemaSource } from '../types/validator.js';

/**
 * Schema cache to avoid re-parsing schemas.
 */
class SchemaCache {
  private cache = new Map<string, unknown>();

  /**
   * Get schema from cache.
   *
   * @param key - Cache key
   * @returns Cached schema or undefined
   */
  get(key: string): unknown | undefined {
    return this.cache.get(key);
  }

  /**
   * Store schema in cache.
   *
   * @param key - Cache key
   * @param schema - Schema object
   */
  set(key: string, schema: unknown): void {
    this.cache.set(key, schema);
  }

  /**
   * Check if schema is in cache.
   *
   * @param key - Cache key
   * @returns True if cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size.
   *
   * @returns Number of cached schemas
   */
  size(): number {
    return this.cache.size;
  }
}

// Global schema cache instance
const globalSchemaCache = new SchemaCache();

/**
 * Load schema from various sources.
 *
 * @param source - Schema source (file path, string, Buffer, or parsed schema)
 * @param useCache - Whether to use caching (default: true)
 * @returns Schema object
 */
export async function loadSchema(source: SchemaSource, useCache: boolean = true): Promise<unknown> {
  // If already a parsed schema object (not string or Buffer), return as-is
  if (typeof source !== 'string' && !Buffer.isBuffer(source)) {
    return source;
  }

  let schemaContent: string;
  let cacheKey: string;

  if (typeof source === 'string') {
    // Check if it's a file path or schema content
    if (source.trim().startsWith('<')) {
      // Schema content
      schemaContent = source;
      cacheKey = `content:${source.substring(0, 100)}`; // Use first 100 chars as key
    } else {
      // File path
      cacheKey = `file:${source}`;

      // Check cache
      if (useCache && globalSchemaCache.has(cacheKey)) {
        return globalSchemaCache.get(cacheKey);
      }

      // Load from file
      const buffer = await readFile(source);
      schemaContent = buffer.toString('utf-8');
    }
  } else {
    // Buffer
    schemaContent = source.toString('utf-8');
    cacheKey = `content:${schemaContent.substring(0, 100)}`;
  }

  // Check cache for content-based keys
  if (useCache && globalSchemaCache.has(cacheKey)) {
    return globalSchemaCache.get(cacheKey);
  }

  // For now, just return the schema content as a string
  // In a real implementation with a proper XSD library, this would parse the schema
  const schema = schemaContent;

  // Cache the schema
  if (useCache) {
    globalSchemaCache.set(cacheKey, schema);
  }

  return schema;
}

/**
 * Get the global schema cache instance.
 *
 * @returns Schema cache
 */
export function getSchemaCache(): SchemaCache {
  return globalSchemaCache;
}

/**
 * Clear the global schema cache.
 */
export function clearSchemaCache(): void {
  globalSchemaCache.clear();
}
