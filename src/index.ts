/**
 * sdcvalidator - SDC4 validator with ExceptionalValue recovery for Node.js
 *
 * @packageDocumentation
 */

// SDC4 exports
export {
  SDC4Validator,
  ErrorMapper,
  InstanceModifier,
  ExceptionalValueType,
  EXCEPTIONAL_VALUE_METADATA,
  SDC4_NAMESPACE,
  DEFAULT_NAMESPACE_PREFIX,
  validateWithRecovery,
  isValid,
  iterErrors,
} from './sdc4/index.js';

// Type exports
export type {
  SDC4ValidatorOptions,
  ValidationError,
  ErrorSummary,
  ValidationErrorWithMapping,
  ValidationReport,
  SaveOptions,
  XMLSource,
  SchemaSource,
  ExceptionalValueMetadata,
  MappingRule,
} from './sdc4/index.js';

// Core exports (for advanced users)
export { MockValidator, ValidationMode, createValidator } from './core/validator.js';
export type { XSDValidator } from './core/validator.js';
export { loadSchema, clearSchemaCache } from './core/schema.js';

// Utility exports (for advanced users)
export { parseXML, serializeXML, cloneDocument } from './utils/xml.js';
export { selectNodes, selectSingleNode, getElementPath } from './utils/xpath.js';
export {
  ensureSDC4Namespace,
  createNamespacedElement,
  isExceptionalValueElement,
  removeExceptionalValues,
} from './utils/namespaces.js';

// Version
export const VERSION = '4.0.0';
