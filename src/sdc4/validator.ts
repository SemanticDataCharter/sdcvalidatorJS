/**
 * SDC4Validator - Main validator class
 *
 * @module sdc4/validator
 */

import { writeFile } from 'fs/promises';

import { ErrorMapper } from './error-mapper.js';
import { InstanceModifier } from './instance-modifier.js';
import { ExceptionalValueType, DEFAULT_NAMESPACE_PREFIX } from './constants.js';
import { loadSchema } from '../core/schema.js';
import { createValidator, ValidationMode, type XSDValidator } from '../core/validator.js';
import { parseXML, serializeXML, cloneDocument } from '../utils/xml.js';
import { removeExceptionalValues } from '../utils/namespaces.js';
import type {
  XMLSource,
  SchemaSource,
  ValidationReport,
  ValidationErrorWithMapping,
  SaveOptions,
} from '../types/validator.js';

/**
 * SDC4Validator configuration options.
 */
export interface SDC4ValidatorOptions {
  /** XSD schema (file path, string, or parsed schema) */
  schema: SchemaSource;

  /** Custom error mapper (optional, uses default if not provided) */
  errorMapper?: ErrorMapper;

  /** Namespace prefix for ExceptionalValue elements (default: 'sdc4') */
  namespacePrefix?: string;

  /** Validation mode (default: 'lax') */
  validation?: 'strict' | 'lax' | 'skip';

  /** Custom XSD validator implementation (optional) */
  validator?: XSDValidator;
}

/**
 * Main validator for SDC4 validation with ExceptionalValue recovery.
 *
 * @example
 * ```typescript
 * const validator = new SDC4Validator({
 *   schema: './schema.xsd'
 * });
 *
 * const recovered = await validator.validateWithRecovery('./data.xml');
 * await validator.saveRecoveredXML('./recovered.xml', recovered);
 * ```
 */
export class SDC4Validator {
  private schema: SchemaSource;
  private errorMapper: ErrorMapper;
  private instanceModifier: InstanceModifier;
  private validationMode: ValidationMode;
  private validator: XSDValidator;

  constructor(options: SDC4ValidatorOptions) {
    this.schema = options.schema;
    this.errorMapper = options.errorMapper || new ErrorMapper();
    this.instanceModifier = new InstanceModifier(
      options.namespacePrefix || DEFAULT_NAMESPACE_PREFIX
    );
    this.validator = options.validator || createValidator();

    // Map validation mode
    switch (options.validation) {
      case 'strict':
        this.validationMode = ValidationMode.STRICT;
        break;
      case 'skip':
        this.validationMode = ValidationMode.SKIP;
        break;
      case 'lax':
      default:
        this.validationMode = ValidationMode.LAX;
    }
  }

  /**
   * Validate XML and inject ExceptionalValue elements at error locations.
   *
   * @param xmlSource - XML document (file path, string, Buffer, or DOM)
   * @param options - Validation options
   * @returns Modified XML DOM with ExceptionalValues
   *
   * @example
   * ```typescript
   * const doc = await validator.validateWithRecovery('./data.xml', {
   *   removeExistingEV: true
   * });
   * ```
   */
  async validateWithRecovery(
    xmlSource: XMLSource,
    options: {
      removeExistingEV?: boolean;
    } = {}
  ): Promise<Document> {
    const { removeExistingEV = true } = options;

    // Parse XML
    const doc = await parseXML(xmlSource);

    // Clone document to avoid modifying original
    const modifiedDoc = cloneDocument(doc);

    // Remove existing ExceptionalValue elements if requested
    if (removeExistingEV) {
      removeExceptionalValues(modifiedDoc);
    }

    // Skip validation if mode is skip
    if (this.validationMode === ValidationMode.SKIP) {
      return modifiedDoc;
    }

    // Load schema
    const loadedSchema = await loadSchema(this.schema);

    // Validate
    const errors = await this.validator.validate(modifiedDoc, loadedSchema);

    // If strict mode and errors found, throw
    if (this.validationMode === ValidationMode.STRICT && errors.length > 0) {
      throw new Error(
        `Validation failed with ${errors.length} error(s): ${errors[0]?.message}`
      );
    }

    // Map errors and inject ExceptionalValues
    if (errors.length > 0) {
      const errorLocations = errors.map((error) => {
        const evType = this.errorMapper.mapError(error);
        return {
          xpath: error.path || '/',
          evType,
          reason: error.message,
        };
      });

      this.instanceModifier.injectExceptionalValues(modifiedDoc, errorLocations);
    }

    return modifiedDoc;
  }

  /**
   * Iterate over validation errors with ExceptionalValue mappings.
   *
   * @param xmlSource - XML document to validate
   * @yields Validation errors with mappings
   *
   * @example
   * ```typescript
   * for await (const error of validator.iterErrorsWithMapping('./data.xml')) {
   *   console.log(`${error.xpath}: ${error.exceptionalValueType}`);
   * }
   * ```
   */
  async *iterErrorsWithMapping(
    xmlSource: XMLSource
  ): AsyncGenerator<ValidationErrorWithMapping> {
    // Parse XML
    const doc = await parseXML(xmlSource);

    // Skip validation if mode is skip
    if (this.validationMode === ValidationMode.SKIP) {
      return;
    }

    // Load schema
    const loadedSchema = await loadSchema(this.schema);

    // Validate
    const errors = await this.validator.validate(doc, loadedSchema);

    // Yield mapped errors
    for (const error of errors) {
      const evType = this.errorMapper.mapError(error);
      const summary = this.errorMapper.getErrorSummary(error, evType);

      yield {
        ...summary,
        ...(error.line !== undefined && { line: error.line }),
        ...(error.column !== undefined && { column: error.column }),
      };
    }
  }

  /**
   * Validate and generate comprehensive report.
   *
   * @param xmlSource - XML document to validate
   * @returns Validation report with statistics
   *
   * @example
   * ```typescript
   * const report = await validator.validateAndReport('./data.xml');
   * console.log(`Errors: ${report.errorCount}`);
   * console.log(JSON.stringify(report, null, 2));
   * ```
   */
  async validateAndReport(xmlSource: XMLSource): Promise<ValidationReport> {
    const errors: ValidationErrorWithMapping[] = [];
    const typeCounts: Record<ExceptionalValueType, number> = {
      [ExceptionalValueType.INV]: 0,
      [ExceptionalValueType.OTH]: 0,
      [ExceptionalValueType.NI]: 0,
      [ExceptionalValueType.NA]: 0,
      [ExceptionalValueType.UNC]: 0,
      [ExceptionalValueType.UNK]: 0,
      [ExceptionalValueType.ASKU]: 0,
      [ExceptionalValueType.ASKR]: 0,
      [ExceptionalValueType.NASK]: 0,
      [ExceptionalValueType.NAV]: 0,
      [ExceptionalValueType.MSK]: 0,
      [ExceptionalValueType.DER]: 0,
      [ExceptionalValueType.PINF]: 0,
      [ExceptionalValueType.NINF]: 0,
      [ExceptionalValueType.TRC]: 0,
    };

    // Collect all errors
    for await (const error of this.iterErrorsWithMapping(xmlSource)) {
      errors.push(error);

      // Count by type
      const evType = error.exceptionalValueType as ExceptionalValueType;
      if (evType in typeCounts) {
        typeCounts[evType]++;
      }
    }

    return {
      valid: errors.length === 0,
      errorCount: errors.length,
      errors,
      exceptionalValueTypeCounts: typeCounts,
    };
  }

  /**
   * Validate XML and save recovered version to file.
   *
   * @param outputPath - Path to save recovered XML
   * @param xmlSource - XML document to validate
   * @param options - Save options
   *
   * @example
   * ```typescript
   * await validator.saveRecoveredXML(
   *   './recovered.xml',
   *   './data.xml',
   *   { encoding: 'UTF-8', prettyPrint: true }
   * );
   * ```
   */
  async saveRecoveredXML(
    outputPath: string,
    xmlSource: XMLSource,
    options: SaveOptions = {}
  ): Promise<void> {
    const {
      encoding = 'UTF-8',
      xmlDeclaration = true,
      prettyPrint = true,
      removeExistingEV = true,
    } = options;

    // Validate with recovery
    const doc = await this.validateWithRecovery(xmlSource, { removeExistingEV });

    // Serialize
    const xml = serializeXML(doc, {
      xmlDeclaration,
      prettyPrint,
      encoding,
    });

    // Write to file
    // eslint-disable-next-line no-undef
    await writeFile(outputPath, xml, encoding.toLowerCase() as BufferEncoding);
  }

  /**
   * Get the error mapper instance.
   *
   * @returns Error mapper
   */
  getErrorMapper(): ErrorMapper {
    return this.errorMapper;
  }

  /**
   * Get the instance modifier.
   *
   * @returns Instance modifier
   */
  getInstanceModifier(): InstanceModifier {
    return this.instanceModifier;
  }

  /**
   * Get the current validation mode.
   *
   * @returns Validation mode
   */
  getValidationMode(): ValidationMode {
    return this.validationMode;
  }
}
