/**
 * Core XML Schema validation - Pluggable validator interface
 *
 * @module core/validator
 */

/* eslint-disable no-unused-vars */

import type { ValidationError, SchemaSource } from '../types/validator.js';

/**
 * Interface for XSD validators.
 * Implement this interface to provide custom XSD validation backends.
 */
export interface XSDValidator {
  /**
   * Validate an XML document against a schema.
   *
   * @param xmlDoc - XML Document to validate
   * @param schema - Schema source
   * @returns Array of validation errors (empty if valid)
   */
  validate(xmlDoc: Document, schema: SchemaSource): Promise<ValidationError[]>;
}

/**
 * Mock validator for development and testing.
 * Always returns valid (no errors).
 *
 * **IMPORTANT:** This is a placeholder. For production use, provide a real
 * XSD validator implementation or use an optional dependency like xsd-schema-validator.
 */
export class MockValidator implements XSDValidator {
  async validate(_xmlDoc: Document, _schema: SchemaSource): Promise<ValidationError[]> {
    // Mock implementation - always valid
    // In real usage, this would call an XSD validator library
    console.warn(
      'MockValidator in use - no actual validation performed. ' +
      'Please provide a real XSDValidator implementation for production use.'
    );
    return [];
  }
}

/**
 * Create a validator with optional custom implementation.
 *
 * @param customValidator - Custom validator implementation (optional)
 * @returns Validator instance
 */
export function createValidator(customValidator?: XSDValidator): XSDValidator {
  if (customValidator) {
    return customValidator;
  }

  // Try to load xsd-schema-validator if available
  try {
    // Dynamic import to handle optional dependency
    // eslint-disable-next-line no-undef
    const xsdValidator = require('xsd-schema-validator');
    return new XSDSchemaValidatorAdapter(xsdValidator);
  } catch {
    // Fall back to mock validator
    return new MockValidator();
  }
}

/**
 * Adapter for xsd-schema-validator library (optional dependency).
 */
class XSDSchemaValidatorAdapter implements XSDValidator {
  constructor(_validator: unknown) {
    // Store validator if needed in the future
  }

  async validate(_xmlDoc: Document, _schema: SchemaSource): Promise<ValidationError[]> {
    try {
      // Implementation would go here if xsd-schema-validator is available
      // For now, return empty array
      console.warn('XSDSchemaValidatorAdapter not fully implemented');
      return [];
    } catch (error) {
      const err = error as Error;
      return [
        {
          message: err.message,
          type: 'validation-error',
        },
      ];
    }
  }
}

/**
 * Validation mode.
 */
export enum ValidationMode {
  /** Strict: Stop on first error */
  STRICT = 'strict',
  /** Lax: Collect all errors */
  LAX = 'lax',
  /** Skip: No validation */
  SKIP = 'skip',
}
