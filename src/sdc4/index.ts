/**
 * SDC4-specific validation functionality
 *
 * @module sdc4
 */

export * from './constants.js';
export * from './error-mapper.js';
export * from './instance-modifier.js';
export * from './validator.js';
export * from './convenience.js';

// Re-export types from types module
export type {
  ValidationError,
  ErrorSummary,
  ValidationErrorWithMapping,
  ValidationReport,
  SaveOptions,
  XMLSource,
  SchemaSource,
} from '../types/validator.js';

// Export ExceptionalValueMetadata type from constants
export type { ExceptionalValueMetadata } from './constants.js';
