/**
 * TypeScript type definitions for SDC4 validator
 *
 * @module types/validator
 */


import type { ExceptionalValueType } from '../sdc4/constants.js';

/**
 * Validation error from XML Schema validator.
 */
export interface ValidationError {
  /** Error message */
  message: string;
  /** XPath to error location */
  path?: string;
  /** Line number in source */
  line?: number;
  /** Column number in source */
  column?: number;
  /** Error type code */
  type?: string;
  /** Additional error context */
  [key: string]: unknown;
}

/**
 * Error summary with ExceptionalValue mapping.
 */
export interface ErrorSummary {
  xpath: string;
  errorType: string;
  reason: string;
  exceptionalValueType: string;
  exceptionalValueName: string;
  description: string;
}

/**
 * Validation error with ExceptionalValue mapping.
 */
export interface ValidationErrorWithMapping extends ErrorSummary {
  line?: number;
  column?: number;
}

/**
 * Comprehensive validation report.
 */
export interface ValidationReport {
  /** Overall validation status (false if any errors) */
  valid: boolean;
  /** Total number of validation errors */
  errorCount: number;
  /** Array of validation errors with mappings */
  errors: ValidationErrorWithMapping[];
  /** Count of each ExceptionalValue type encountered */
  exceptionalValueTypeCounts: Record<ExceptionalValueType, number>;
}

/**
 * Options for saving recovered XML.
 */
export interface SaveOptions {
  /** Character encoding (default: 'UTF-8') */
  encoding?: string;
  /** Include XML declaration (default: true) */
  xmlDeclaration?: boolean;
  /** Pretty-print output (default: true) */
  prettyPrint?: boolean;
  /** Remove existing ExceptionalValue elements before recovery (default: true) */
  removeExistingEV?: boolean;
}

/**
 * XML source type - can be file path, string, Buffer, or DOM Document.
 */
export type XMLSource = string | Buffer | Document;

/**
 * Schema source type - can be file path, string, Buffer, or parsed schema object.
 */
export type SchemaSource = string | Buffer | unknown;
