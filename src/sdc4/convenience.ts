/**
 * Convenience functions for SDC4 validation
 *
 * @module sdc4/convenience
 */


import { SDC4Validator, type SDC4ValidatorOptions } from './validator.js';
import type { ValidationErrorWithMapping } from '../types/validator.js';

/**
 * Convenience function options.
 */
export interface ValidateOptions {
  namespacePrefix?: string;
  validation?: 'strict' | 'lax' | 'skip';
}

/**
 * Validate XML with recovery (convenience function).
 *
 * @param schemaPath - Path to XSD schema file
 * @param xmlPath - Path to XML file
 * @param outputPath - Optional path to save recovered XML
 * @param options - Validation options
 * @returns Recovered XML DOM
 *
 * @example
 * ```typescript
 * const doc = await validateWithRecovery(
 *   './schema.xsd',
 *   './data.xml',
 *   './recovered.xml'
 * );
 * ```
 */
export async function validateWithRecovery(
  schemaPath: string,
  xmlPath: string,
  outputPath?: string,
  options: ValidateOptions = {}
): Promise<Document> {
  const validatorOptions: SDC4ValidatorOptions = {
    schema: schemaPath,
    ...options,
  };

  const validator = new SDC4Validator(validatorOptions);
  const doc = await validator.validateWithRecovery(xmlPath);

  if (outputPath) {
    await validator.saveRecoveredXML(outputPath, doc);
  }

  return doc;
}

/**
 * Check if XML is valid against schema.
 *
 * @param schemaPath - Path to XSD schema file
 * @param xmlPath - Path to XML file
 * @returns True if valid, false otherwise
 *
 * @example
 * ```typescript
 * if (await isValid('./schema.xsd', './data.xml')) {
 *   console.log('Valid!');
 * }
 * ```
 */
export async function isValid(
  schemaPath: string,
  xmlPath: string
): Promise<boolean> {
  const validator = new SDC4Validator({
    schema: schemaPath,
    validation: 'lax',
  });

  const report = await validator.validateAndReport(xmlPath);
  return report.valid;
}

/**
 * Iterate over validation errors (convenience function).
 *
 * @param schemaPath - Path to XSD schema file
 * @param xmlPath - Path to XML file
 * @yields Validation errors with mappings
 *
 * @example
 * ```typescript
 * for await (const error of iterErrors('./schema.xsd', './data.xml')) {
 *   console.log(error.xpath, error.reason);
 * }
 * ```
 */
export async function* iterErrors(
  schemaPath: string,
  xmlPath: string
): AsyncGenerator<ValidationErrorWithMapping> {
  const validator = new SDC4Validator({
    schema: schemaPath,
    validation: 'lax',
  });

  yield* validator.iterErrorsWithMapping(xmlPath);
}
