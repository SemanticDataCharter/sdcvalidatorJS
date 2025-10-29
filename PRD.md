# Product Requirements Document (PRD)
# sdcvalidatorJS

**Version:** 4.0
**Date:** October 28, 2025
**Author:** Axius SDC, Inc.
**Status:** Draft for Review

**Note:** This package follows SDC ecosystem semantic versioning where the major version indicates the SDC reference model version. This is **SDC Release 4**, so the first package version will be **4.0.0**.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Users](#3-target-users)
4. [Technical Stack](#4-technical-stack)
5. [Functional Requirements](#5-functional-requirements)
6. [API Design](#6-api-design)
7. [Architecture](#7-architecture)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Implementation Phases](#9-implementation-phases)
10. [Success Criteria](#10-success-criteria)
11. [Out of Scope](#11-out-of-scope)
12. [Dependencies](#12-dependencies)
13. [Risks and Mitigations](#13-risks-and-mitigations)
14. [Appendices](#14-appendices)

---

## 1. Executive Summary

### 1.1 Project Overview

**sdcvalidatorJS** is a Node.js/TypeScript port of the Python `sdcvalidator` package, providing SDC4 (Semantic Data Charter Release 4) validation with ExceptionalValue recovery for JavaScript/TypeScript applications.

### 1.2 Purpose

Enable Node.js backend services, data processing pipelines, and CLI tools to validate XML documents against SDC4 schemas using the unique "quarantine-and-tag" pattern for data quality management.

### 1.3 Scope

**Phase 1 (v4.0.0):** Core SDC4 validation functionality only - no JSON conversion, no advanced converters, no browser support. Focus on production-ready server-side validation with ExceptionalValue recovery.

### 1.4 Versioning Convention

This package follows the SDC ecosystem semantic versioning convention:

- **Major version** = SDC reference model version (e.g., `4.x.x` for SDC Release 4)
- **Minor version** = New features/enhancements (e.g., `4.1.0` for JSON conversion)
- **Patch version** = Bug fixes (e.g., `4.0.1` for bug fixes)

**First release:** `4.0.0` (SDC Release 4, initial implementation)
**Future releases:** `4.1.0`, `4.2.0`, etc. (new features), `4.0.1`, `4.0.2`, etc. (bug fixes)
**Next major:** `5.0.0` (when SDC Release 5 is published)

### 1.5 Business Value

- **Port existing Python workflows** to JavaScript/TypeScript ecosystems
- **Enable SDC validation** in Node.js backend services (Express, Fastify, NestJS, etc.)
- **Support data quality management** in JavaScript-based ETL pipelines
- **Provide CLI tools** for developers and DevOps teams
- **Foundation for future features** (JSON conversion, React integration, etc.)

---

## 2. Product Vision

### 2.1 Problem Statement

Traditional XML Schema validation is binary: data either validates completely or is rejected. This approach fails in real-world scenarios where:

1. **Partial data quality** - Some fields are valid, others are not
2. **Data preservation requirements** - Regulations require keeping all submitted data
3. **Audit trails** - Organizations need to track what data was invalid and why
4. **Graceful degradation** - Systems should process what's valid while flagging issues

Current JavaScript XML validators (ajv-xsd, libxml-xsd, xsd-schema-validator) only provide binary validation without recovery mechanisms.

### 2.2 Solution

Implement the SDC4 "quarantine-and-tag" pattern in JavaScript:

1. **Validate** XML against XSD 1.1 schemas
2. **Classify errors** using pattern-based ErrorMapper (15 ISO 21090 ExceptionalValue types)
3. **Inject ExceptionalValue elements** at error locations in the XML DOM
4. **Preserve invalid data** alongside quality flags
5. **Report data quality metrics** for monitoring and improvement

### 2.3 Why JavaScript?

The JavaScript/Node.js ecosystem needs this capability because:

- **Modern web backends** are increasingly built with Node.js/TypeScript
- **React/Vue/Angular frontends** may eventually need client-side validation
- **JavaScript ETL tools** (Airbyte connectors, n8n workflows) lack SDC4 support
- **API gateways** (Kong, Express) could validate SDC payloads
- **Serverless functions** (AWS Lambda, Cloudflare Workers) need lightweight validators

---

## 3. Target Users

### 3.1 Primary Users

1. **Backend Node.js Developers**
   - Building healthcare data APIs
   - Implementing research data submission systems
   - Creating data validation services

2. **Data Engineers**
   - Building ETL pipelines in JavaScript
   - Processing healthcare/research data
   - Implementing data quality checks

3. **DevOps/Platform Engineers**
   - Setting up validation CLI tools
   - Integrating validation into CI/CD pipelines
   - Monitoring data quality metrics

### 3.2 Secondary Users

1. **Quality Assurance Teams** - Using CLI for data quality testing
2. **Data Scientists** - Validating datasets before analysis
3. **Compliance Officers** - Ensuring data meets regulatory standards

### 3.3 User Expertise Level

- **JavaScript/TypeScript:** Intermediate to Advanced
- **XML/XSD:** Beginner to Intermediate (detailed docs will compensate)
- **SDC4:** Beginner (most users new to SDC4 concepts)
- **Node.js ecosystem:** Intermediate (npm, package.json, etc.)

---

## 4. Technical Stack

### 4.1 Core Technologies

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Language** | TypeScript | 5.x | Type safety, IDE support, maintainability |
| **Runtime** | Node.js | 18.x LTS+ | Stable LTS, wide adoption, modern features |
| **Package Manager** | npm | 9.x+ | Standard Node.js package manager |
| **Module System** | ESM (ES Modules) | ES2022 | Modern, tree-shakable, future-proof |
| **Target Output** | CommonJS + ESM | Dual build | Compatibility with both old and new Node.js projects |

### 4.2 Key Dependencies

| Library | Purpose | Justification |
|---------|---------|---------------|
| **libxmljs2** | XML parsing/validation | Fast (C++ bindings), XSD 1.1 support, mature |
| **xpath** | XPath evaluation | Error location, element selection |
| **@xmldom/xmldom** | DOM manipulation | Lightweight, standard DOM API |

**Alternative considered:** `fast-xml-parser` (pure JS, no XSD validation)
**Decision:** Use `libxmljs2` for native performance and XSD support

### 4.3 Development Dependencies

| Tool | Purpose |
|------|---------|
| **Vitest** | Testing framework (fast, TypeScript-first) |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **tsx** | TypeScript execution for development |
| **tsup** | TypeScript bundler for library builds |

### 4.4 Build Tooling

- **Bundler:** tsup (fast, dual CJS/ESM output)
- **Type Checking:** tsc (TypeScript compiler)
- **Documentation:** TypeDoc (TypeScript API docs)

---

## 5. Functional Requirements

### 5.1 Core Features (MUST HAVE - v1.0)

#### FR-1: XML Schema Validation

**Description:** Validate XML documents against XSD 1.1 schemas.

**Acceptance Criteria:**
- ✓ Load XSD schema from file path
- ✓ Load XSD schema from string
- ✓ Validate XML instance against schema
- ✓ Support XSD 1.0 and XSD 1.1 features
- ✓ Handle schema imports and includes
- ✓ Support namespaces and qualified names
- ✓ Collect all validation errors (not just first error)

**Dependencies:** libxmljs2

---

#### FR-2: Error Classification (ErrorMapper)

**Description:** Map XML Schema validation errors to 15 ISO 21090 ExceptionalValue types using pattern-based rules.

**Acceptance Criteria:**
- ✓ Implement all 15 ExceptionalValue types as TypeScript enum
- ✓ Pattern-based error classification using regex rules
- ✓ Support custom rule addition via `addRule()` method
- ✓ Default rule priority (first match wins)
- ✓ Generate error summary with XPath location

**Error Mapping Rules (Priority Order):**

1. **Missing Required → NI (No Information)**
   - Patterns: `missing required`, `required .* is missing`, `element .* is required`

2. **Type Violations → INV (Invalid)**
   - Patterns: `not a valid value`, `invalid value`, `is not valid for type`, `cannot be converted`

3. **Constraint Violations → INV**
   - Patterns: `pattern.*not matched`, `length constraint`, `assertion.*failed`

4. **Enumeration Violations → OTH (Other)**
   - Patterns: `not in enumeration`, `not.*allowed value`, `invalid enumeration`

5. **Unexpected Content → NA (Not Applicable)**
   - Patterns: `unexpected`, `not allowed`, `extra element`, `unknown element`

6. **Encoding Errors → UNC (Unencoded)**
   - Patterns: `encoding error`, `decode error`, `invalid character`

7. **Default Fallback → NI**

**Dependencies:** None (pure TypeScript)

---

#### FR-3: ExceptionalValue Injection

**Description:** Inject ExceptionalValue elements into XML DOM at error locations while preserving invalid data.

**Acceptance Criteria:**
- ✓ Create ExceptionalValue element with proper namespace (`https://semanticdatacharter.com/ns/sdc4/`)
- ✓ Insert element at correct sequence position in parent
- ✓ Set element name based on ExceptionalValueType (e.g., `<sdc4:INV>`)
- ✓ Add child `<sdc4:ev-name>` element with type description
- ✓ Preserve original invalid content
- ✓ Handle multiple errors in same parent element
- ✓ Support custom namespace prefix (default: `sdc4`)

**Example:**

**Input (invalid):**
```xml
<sdc4:Person>
    <name>John Doe</name>
    <age>not_a_number</age>
</sdc4:Person>
```

**Output (recovered):**
```xml
<sdc4:Person>
    <name>John Doe</name>
    <sdc4:INV>
        <sdc4:ev-name>Invalid</sdc4:ev-name>
    </sdc4:INV>
    <age>not_a_number</age>
</sdc4:Person>
```

**Dependencies:** @xmldom/xmldom, xpath

---

#### FR-4: SDC4Validator Class (Main API)

**Description:** Primary interface for SDC4 validation with recovery.

**TypeScript Interface:**

```typescript
interface SDC4ValidatorOptions {
  schema: string | Buffer | XMLSchema11;  // XSD schema
  errorMapper?: ErrorMapper;               // Custom error mapper
  namespacePrefix?: string;                // Default: 'sdc4'
  validation?: 'strict' | 'lax' | 'skip'; // Default: 'lax'
}

class SDC4Validator {
  constructor(options: SDC4ValidatorOptions);

  // Main validation with recovery
  validateWithRecovery(
    xmlSource: string | Buffer | Document,
    options?: { removeExistingEV?: boolean }
  ): Promise<Document>;

  // Iterate over errors with mapping
  iterErrorsWithMapping(
    xmlSource: string | Buffer | Document
  ): AsyncGenerator<ValidationErrorWithMapping>;

  // Validate and generate report
  validateAndReport(
    xmlSource: string | Buffer | Document
  ): Promise<ValidationReport>;

  // Save recovered XML to file
  saveRecoveredXML(
    outputPath: string,
    xmlSource: string | Buffer | Document,
    options?: SaveOptions
  ): Promise<void>;
}
```

**Acceptance Criteria:**
- ✓ Instantiate with schema file path or schema object
- ✓ Validate XML and return modified DOM with ExceptionalValues
- ✓ Support both sync and async operations where appropriate
- ✓ Handle errors gracefully with clear error messages
- ✓ Support schema caching (don't re-parse on every validation)

**Dependencies:** All above components

---

#### FR-5: Validation Reporting

**Description:** Generate detailed validation reports with error statistics.

**Report Format:**

```typescript
interface ValidationReport {
  valid: boolean;                         // Overall validation status
  errorCount: number;                     // Total validation errors
  errors: Array<{
    xpath: string;                        // XPath to error location
    errorType: string;                    // Error category (e.g., "type-error")
    reason: string;                       // Human-readable error message
    exceptionalValueType: string;         // Mapped EV type code (e.g., "INV")
    exceptionalValueName: string;         // EV type name (e.g., "Invalid")
    description: string;                  // EV type description
  }>;
  exceptionalValueTypeCounts: {           // Distribution of EV types
    INV: number;
    OTH: number;
    NI: number;
    // ... all 15 types
  };
}
```

**Acceptance Criteria:**
- ✓ Count total errors
- ✓ Provide XPath location for each error
- ✓ Include error reason from schema validator
- ✓ Map to ExceptionalValue type
- ✓ Calculate distribution statistics
- ✓ Return as JSON-serializable object

**Dependencies:** SDC4Validator, ErrorMapper

---

#### FR-6: File I/O Operations

**Description:** Read XML from files and write recovered XML to files.

**Acceptance Criteria:**
- ✓ Read XML from file path (async)
- ✓ Write recovered XML to file path (async)
- ✓ Support UTF-8 encoding (default)
- ✓ Include XML declaration (`<?xml version="1.0" encoding="UTF-8"?>`)
- ✓ Pretty-print output XML (optional, default: true)
- ✓ Handle file system errors gracefully

**Dependencies:** Node.js `fs/promises`

---

#### FR-7: Namespace Handling

**Description:** Proper SDC4 namespace management.

**Requirements:**
- Default SDC4 namespace: `https://semanticdatacharter.com/ns/sdc4/`
- Default namespace prefix: `sdc4`
- Support custom prefix configuration
- Preserve existing namespaces in document
- Handle namespace declarations correctly

**Acceptance Criteria:**
- ✓ Inject namespace declaration if not present
- ✓ Use configured prefix for ExceptionalValue elements
- ✓ Don't duplicate namespace declarations
- ✓ Support documents with multiple namespaces

---

#### FR-8: Convenience Functions

**Description:** Top-level functions for simple use cases.

```typescript
// Quick validation with recovery
async function validateWithRecovery(
  schemaPath: string,
  xmlPath: string,
  outputPath?: string,
  options?: ValidateOptions
): Promise<Document>;

// Quick validation check
async function isValid(
  schemaPath: string,
  xmlPath: string
): Promise<boolean>;

// Quick error iteration
async function* iterErrors(
  schemaPath: string,
  xmlPath: string
): AsyncGenerator<ValidationErrorWithMapping>;
```

**Acceptance Criteria:**
- ✓ Provide simple function-based API
- ✓ Handle schema loading internally
- ✓ Support file paths only (most common use case)
- ✓ Return meaningful results

---

### 5.2 CLI Features (SHOULD HAVE - v1.0)

#### FR-9: Command-Line Interface

**Description:** CLI tool for SDC4 validation from terminal.

**Commands:**

```bash
# Validate XML file
sdcvalidate <xml-file> --schema <schema-file>

# Validate with recovery and save output
sdcvalidate <xml-file> --schema <schema-file> --recover -o <output-file>

# Generate validation report
sdcvalidate <xml-file> --schema <schema-file> --report

# Check if valid (exit code 0 = valid, 1 = invalid)
sdcvalidate <xml-file> --schema <schema-file> --check
```

**Options:**
- `--schema, -s`: Path to XSD schema file (required)
- `--recover, -r`: Enable recovery mode (inject ExceptionalValues)
- `--output, -o`: Output file path for recovered XML
- `--report`: Generate JSON validation report
- `--check`: Exit with code 0 if valid, 1 if invalid
- `--prefix, -p`: Namespace prefix for ExceptionalValues (default: sdc4)
- `--verbose, -v`: Verbose output
- `--version`: Show version
- `--help, -h`: Show help

**Acceptance Criteria:**
- ✓ Install globally via `npm install -g sdcvalidator`
- ✓ Available as `sdcvalidate` command
- ✓ Parse command-line arguments
- ✓ Handle file not found errors
- ✓ Return appropriate exit codes
- ✓ Display help text
- ✓ Show version number

**Dependencies:** commander (CLI framework)

---

### 5.3 Nice-to-Have Features (COULD HAVE - Future)

*Explicitly deferred to v4.1.0+*

- JSON conversion (XML ↔ JSON with multiple converters)
- Browser/WASM support for client-side validation
- Streaming validation for large files
- Batch validation of multiple files
- Watch mode for development
- Custom ExceptionalValue templates
- Plugin system for extensibility

---

## 6. API Design

### 6.1 Package Structure

```typescript
// Main exports
export { SDC4Validator } from './sdc4/validator';
export { ErrorMapper } from './sdc4/error-mapper';
export { ExceptionalValueType } from './sdc4/constants';

// Convenience functions
export {
  validateWithRecovery,
  isValid,
  iterErrors
} from './sdc4/convenience';

// Types
export type {
  SDC4ValidatorOptions,
  ValidationReport,
  ValidationErrorWithMapping,
  SaveOptions
} from './types';

// Constants
export { SDC4_NAMESPACE } from './sdc4/constants';
```

### 6.2 TypeScript Definitions

#### 6.2.1 ExceptionalValueType Enum

```typescript
/**
 * ISO 21090-based ExceptionalValue types for SDC4 validation.
 *
 * These types classify validation errors into standardized categories
 * for data quality management and reporting.
 */
export enum ExceptionalValueType {
  /** Invalid: Value does not conform to expected type/format */
  INV = 'INV',

  /** Other: Value is valid but doesn't match expected enumeration */
  OTH = 'OTH',

  /** No Information: Required value is missing */
  NI = 'NI',

  /** Not Applicable: Content present but not expected in this context */
  NA = 'NA',

  /** Unencoded: Value contains invalid characters or encoding */
  UNC = 'UNC',

  /** Unknown: Value explicitly marked as unknown */
  UNK = 'UNK',

  /** Asked but Unknown: Data was requested but respondent didn't know */
  ASKU = 'ASKU',

  /** Asked and Refused: Data was requested but respondent refused */
  ASKR = 'ASKR',

  /** Not Asked: Data was not requested */
  NASK = 'NASK',

  /** Not Available: Data not currently available */
  NAV = 'NAV',

  /** Masked: Data hidden for privacy/security */
  MSK = 'MSK',

  /** Derived: Value calculated from other values */
  DER = 'DER',

  /** Positive Infinity: Numeric value exceeds maximum */
  PINF = 'PINF',

  /** Negative Infinity: Numeric value below minimum */
  NINF = 'NINF',

  /** Trace: Value present in trace amounts */
  TRC = 'TRC'
}

/**
 * Metadata for each ExceptionalValue type.
 */
export interface ExceptionalValueMetadata {
  code: string;
  name: string;
  description: string;
}

export const EXCEPTIONAL_VALUE_METADATA: Record<ExceptionalValueType, ExceptionalValueMetadata>;
```

#### 6.2.2 ErrorMapper Class

```typescript
/**
 * Maps XML Schema validation errors to ExceptionalValue types
 * using pattern-based rules.
 */
export class ErrorMapper {
  /**
   * Create a new ErrorMapper with default rules.
   */
  constructor();

  /**
   * Add a custom error mapping rule.
   * Rules are evaluated in order; first match wins.
   *
   * @param condition - Function that returns true if rule applies
   * @param evType - ExceptionalValue type to assign
   * @param priority - Rule priority (lower = higher priority)
   */
  addRule(
    condition: (error: ValidationError) => boolean,
    evType: ExceptionalValueType,
    priority?: number
  ): void;

  /**
   * Map a validation error to an ExceptionalValue type.
   *
   * @param error - Validation error from schema validator
   * @returns Mapped ExceptionalValue type
   */
  mapError(error: ValidationError): ExceptionalValueType;

  /**
   * Get error summary with metadata.
   *
   * @param error - Validation error
   * @param evType - Mapped ExceptionalValue type
   * @returns Error summary object
   */
  getErrorSummary(
    error: ValidationError,
    evType: ExceptionalValueType
  ): ErrorSummary;
}

/**
 * Validation error from XML Schema validator.
 */
export interface ValidationError {
  message: string;      // Error message
  path?: string;        // XPath to error location
  line?: number;        // Line number in source
  column?: number;      // Column number in source
  type?: string;        // Error type code
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
```

#### 6.2.3 SDC4Validator Class

```typescript
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
  /**
   * Create a new SDC4Validator.
   *
   * @param options - Validator configuration
   */
  constructor(options: SDC4ValidatorOptions);

  /**
   * Validate XML and inject ExceptionalValue elements at error locations.
   *
   * @param xmlSource - XML document (file path, string, or DOM)
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
  validateWithRecovery(
    xmlSource: string | Buffer | Document,
    options?: {
      removeExistingEV?: boolean;  // Remove existing ExceptionalValues (default: true)
    }
  ): Promise<Document>;

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
  iterErrorsWithMapping(
    xmlSource: string | Buffer | Document
  ): AsyncGenerator<ValidationErrorWithMapping>;

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
  validateAndReport(
    xmlSource: string | Buffer | Document
  ): Promise<ValidationReport>;

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
  saveRecoveredXML(
    outputPath: string,
    xmlSource: string | Buffer | Document,
    options?: SaveOptions
  ): Promise<void>;
}

/**
 * SDC4Validator configuration options.
 */
export interface SDC4ValidatorOptions {
  /** XSD schema (file path, string, or parsed schema) */
  schema: string | Buffer | XMLSchema11;

  /** Custom error mapper (optional, uses default if not provided) */
  errorMapper?: ErrorMapper;

  /** Namespace prefix for ExceptionalValue elements (default: 'sdc4') */
  namespacePrefix?: string;

  /** Validation mode (default: 'lax') */
  validation?: 'strict' | 'lax' | 'skip';
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
 * Validation error with ExceptionalValue mapping.
 */
export interface ValidationErrorWithMapping {
  xpath: string;
  errorType: string;
  reason: string;
  exceptionalValueType: ExceptionalValueType;
  exceptionalValueName: string;
  description: string;
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
```

#### 6.2.4 Convenience Functions

```typescript
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
  options?: ValidateOptions
): Promise<Document>;

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
): Promise<boolean>;

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
): AsyncGenerator<ValidationErrorWithMapping>;

export interface ValidateOptions {
  namespacePrefix?: string;
  validation?: 'strict' | 'lax' | 'skip';
  errorMapper?: ErrorMapper;
}
```

### 6.3 Usage Examples

#### Example 1: Basic Validation with Recovery

```typescript
import { SDC4Validator } from 'sdcvalidator';

const validator = new SDC4Validator({
  schema: './schema.xsd'
});

const recovered = await validator.validateWithRecovery('./data.xml');
await validator.saveRecoveredXML('./recovered.xml', recovered);
```

#### Example 2: Validation Report

```typescript
import { SDC4Validator } from 'sdcvalidator';

const validator = new SDC4Validator({ schema: './schema.xsd' });
const report = await validator.validateAndReport('./data.xml');

console.log(`Valid: ${report.valid}`);
console.log(`Errors: ${report.errorCount}`);
console.log(`Invalid (INV): ${report.exceptionalValueTypeCounts.INV}`);
console.log(`Missing (NI): ${report.exceptionalValueTypeCounts.NI}`);
```

#### Example 3: Custom Error Mapping

```typescript
import { SDC4Validator, ErrorMapper, ExceptionalValueType } from 'sdcvalidator';

const errorMapper = new ErrorMapper();

// Custom rule: classify "protected" errors as Masked
errorMapper.addRule(
  (error) => error.message.toLowerCase().includes('protected'),
  ExceptionalValueType.MSK
);

const validator = new SDC4Validator({
  schema: './schema.xsd',
  errorMapper
});

const recovered = await validator.validateWithRecovery('./data.xml');
```

#### Example 4: Error Iteration

```typescript
import { SDC4Validator } from 'sdcvalidator';

const validator = new SDC4Validator({ schema: './schema.xsd' });

for await (const error of validator.iterErrorsWithMapping('./data.xml')) {
  console.log(`[${error.exceptionalValueType}] ${error.xpath}`);
  console.log(`  Reason: ${error.reason}`);
}
```

#### Example 5: Convenience Functions

```typescript
import { validateWithRecovery, isValid } from 'sdcvalidator';

// Quick validation check
if (await isValid('./schema.xsd', './data.xml')) {
  console.log('Data is valid!');
} else {
  // Recover and save
  await validateWithRecovery('./schema.xsd', './data.xml', './recovered.xml');
}
```

#### Example 6: CLI Usage

```bash
# Check if valid
sdcvalidate data.xml --schema schema.xsd --check
echo $?  # 0 = valid, 1 = invalid

# Recover and save
sdcvalidate data.xml -s schema.xsd --recover -o recovered.xml

# Generate report
sdcvalidate data.xml -s schema.xsd --report > report.json

# Custom namespace prefix
sdcvalidate data.xml -s schema.xsd -r -o out.xml --prefix myns
```

---

## 7. Architecture

### 7.1 Directory Structure

```
sdcvalidatorJS/
├── src/                          # Source code (TypeScript)
│   ├── sdc4/                     # SDC4-specific functionality
│   │   ├── validator.ts          # SDC4Validator class
│   │   ├── error-mapper.ts       # ErrorMapper class
│   │   ├── instance-modifier.ts  # XML DOM modification
│   │   ├── constants.ts          # ExceptionalValueType enum
│   │   ├── convenience.ts        # Convenience functions
│   │   └── index.ts              # Exports
│   ├── core/                     # Core validation (wrapper around libxmljs2)
│   │   ├── schema.ts             # Schema loading and caching
│   │   ├── validator.ts          # Core XML validation
│   │   ├── errors.ts             # Error extraction and formatting
│   │   └── index.ts              # Exports
│   ├── utils/                    # Utilities
│   │   ├── xml.ts                # XML parsing/serialization helpers
│   │   ├── xpath.ts              # XPath evaluation helpers
│   │   ├── namespaces.ts         # Namespace handling
│   │   ├── fs.ts                 # File system helpers
│   │   └── index.ts              # Exports
│   ├── cli/                      # Command-line interface
│   │   ├── commands/             # CLI command implementations
│   │   │   ├── validate.ts
│   │   │   ├── recover.ts
│   │   │   └── report.ts
│   │   ├── cli.ts                # Main CLI entry point
│   │   └── index.ts              # Exports
│   ├── types/                    # TypeScript type definitions
│   │   ├── validator.ts
│   │   ├── errors.ts
│   │   ├── reports.ts
│   │   └── index.ts
│   └── index.ts                  # Main package export
├── tests/                        # Test files (Vitest)
│   ├── sdc4/
│   │   ├── validator.test.ts
│   │   ├── error-mapper.test.ts
│   │   ├── instance-modifier.test.ts
│   │   └── integration.test.ts
│   ├── core/
│   │   ├── schema.test.ts
│   │   └── validator.test.ts
│   ├── cli/
│   │   └── cli.test.ts
│   ├── fixtures/                 # Test data
│   │   ├── schemas/
│   │   │   └── test-schema.xsd
│   │   ├── valid/
│   │   │   └── valid-instance.xml
│   │   └── invalid/
│   │       └── invalid-instance.xml
│   └── utils/
│       └── test-helpers.ts
├── examples/                     # Usage examples
│   ├── basic-validation.ts
│   ├── custom-error-mapping.ts
│   ├── reporting.ts
│   └── README.md
├── docs/                         # Documentation
│   ├── api/                      # API documentation (TypeDoc output)
│   ├── guides/                   # User guides
│   │   ├── getting-started.md
│   │   ├── error-mapping.md
│   │   ├── cli-usage.md
│   │   └── advanced-usage.md
│   └── README.md
├── dist/                         # Build output (gitignored)
│   ├── esm/                      # ES module build
│   ├── cjs/                      # CommonJS build
│   └── types/                    # TypeScript declarations
├── .github/                      # GitHub configuration
│   └── workflows/
│       ├── ci.yml                # CI pipeline
│       └── publish.yml           # NPM publish workflow
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.build.json           # Build-specific TS config
├── tsup.config.ts                # Build configuration
├── vitest.config.ts              # Test configuration
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── .gitignore                    # Git ignore rules
├── LICENSE                       # MIT License
├── README.md                     # Package README
├── CHANGELOG.md                  # Version history
└── PRD.md                        # This document
```

### 7.2 Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  cli/cli.ts  (Commander)                             │   │
│  │  ├── validate command                                │   │
│  │  ├── recover command                                 │   │
│  │  └── report command                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SDC4 API Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  sdc4/validator.ts  (SDC4Validator)                  │   │
│  │  ├── validateWithRecovery()                          │   │
│  │  ├── iterErrorsWithMapping()                         │   │
│  │  ├── validateAndReport()                             │   │
│  │  └── saveRecoveredXML()                              │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                  │                  │            │
│           ▼                  ▼                  ▼            │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │error-mapper │   │instance-     │   │convenience.ts   │  │
│  │.ts          │   │modifier.ts   │   │                 │  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Core Validation Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  core/validator.ts                                   │   │
│  │  ├── validate() - libxmljs2 wrapper                 │   │
│  │  └── extractErrors() - error normalization          │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  core/schema.ts                                      │   │
│  │  ├── loadSchema() - parse XSD                       │   │
│  │  └── SchemaCache - schema caching                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Utilities Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ utils/xml.ts │  │utils/xpath.ts│  │utils/namespaces. │  │
│  │              │  │              │  │ts                │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐                                           │
│  │ utils/fs.ts  │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Dependencies                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ libxmljs2    │  │ xpath        │  │ @xmldom/xmldom   │  │
│  │ (XSD         │  │ (XPath)      │  │ (DOM)            │  │
│  │  validation) │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Data Flow

#### Validation with Recovery Flow:

```
1. User calls SDC4Validator.validateWithRecovery()
   │
   ├─▶ 2. Load and cache XSD schema (core/schema.ts)
   │
   ├─▶ 3. Parse XML document (utils/xml.ts)
   │
   ├─▶ 4. Validate XML against schema (core/validator.ts → libxmljs2)
   │      └─▶ Extract validation errors
   │
   ├─▶ 5. For each error:
   │      │
   │      ├─▶ 5a. Map error to ExceptionalValueType (error-mapper.ts)
   │      │
   │      ├─▶ 5b. Locate error position via XPath (utils/xpath.ts)
   │      │
   │      └─▶ 5c. Inject ExceptionalValue element (instance-modifier.ts)
   │
   └─▶ 6. Return modified XML DOM
```

### 7.4 Design Patterns

1. **Facade Pattern**
   - `SDC4Validator` provides simplified interface to complex validation logic
   - Convenience functions hide implementation details

2. **Strategy Pattern**
   - `ErrorMapper` uses pluggable rule system
   - Different validation modes (strict, lax, skip)

3. **Iterator Pattern**
   - `iterErrorsWithMapping()` for lazy error processing
   - Async generators for efficient streaming

4. **Singleton Pattern**
   - Schema cache to avoid re-parsing schemas

5. **Factory Pattern**
   - Error creation and mapping
   - ExceptionalValue element creation

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Schema Loading** | < 500ms for 100KB schema | Vitest benchmark |
| **Validation Speed** | > 1000 elements/sec | Vitest benchmark with large XML |
| **Memory Usage** | < 100MB for 10MB XML | Node.js heap profiling |
| **Startup Time (CLI)** | < 1 second | Hyperfine benchmarking |

**Optimization Strategies:**
- Schema caching (parse once, reuse)
- Native C++ libraries (libxmljs2) for performance
- Lazy error iteration (don't collect all errors upfront)
- Minimal dependencies to reduce bundle size

### 8.2 Reliability

**Requirements:**
- Zero crashes on valid input
- Graceful error handling for invalid input
- Memory leaks: None detected in 1000 validation cycles
- Undefined behavior: None in production code

**Error Handling Standards:**
- All file I/O wrapped in try-catch
- Clear error messages with actionable guidance
- No silent failures
- Proper cleanup of resources (file handles, etc.)

### 8.3 Compatibility

| Environment | Version Support | Notes |
|-------------|----------------|-------|
| **Node.js** | 18.x LTS, 20.x LTS, 22.x+ | Active and Maintenance LTS |
| **npm** | 9.x+ | Modern npm features |
| **TypeScript** | 5.x | Consumers using TypeScript |
| **OS** | Linux, macOS, Windows | CI tests on all three |

**Module Formats:**
- ESM (ES Modules) - Primary
- CommonJS - Compatibility build

### 8.4 Testing

**Coverage Targets:**
- **Line Coverage:** ≥ 90%
- **Branch Coverage:** ≥ 85%
- **Function Coverage:** ≥ 95%

**Test Types:**

1. **Unit Tests**
   - Every exported function/class
   - Edge cases and error conditions
   - Mock external dependencies

2. **Integration Tests**
   - End-to-end validation workflows
   - Real XSD schemas and XML instances
   - File I/O operations

3. **CLI Tests**
   - Command parsing
   - Exit codes
   - Output formatting

4. **Performance Tests**
   - Benchmark suite for regression detection
   - Large file handling (1MB, 10MB, 100MB)

**Test Data:**
- Use real SDC4 example from Python package (StatePopulation)
- Create minimal test cases for specific error types
- Include both valid and invalid instances

### 8.5 Documentation

**Required Documentation:**

1. **README.md**
   - Installation instructions
   - Quick start guide
   - Basic examples
   - Link to full documentation

2. **API Documentation**
   - TypeDoc-generated API reference
   - Comprehensive JSDoc comments
   - Usage examples for every public API

3. **User Guides**
   - Getting Started guide
   - Error Mapping guide
   - CLI Usage guide
   - Advanced Usage guide

4. **Examples**
   - Runnable TypeScript examples
   - Cover all major use cases
   - Include expected output

5. **CHANGELOG.md**
   - Semantic versioning
   - Document breaking changes
   - Migration guides for major versions

### 8.6 Maintainability

**Code Quality Standards:**
- ESLint (strict mode) - Zero errors, zero warnings
- Prettier - Consistent formatting
- TypeScript strict mode enabled
- No `any` types (use `unknown` with type guards)
- Maximum function length: 50 lines
- Maximum file length: 500 lines
- Cyclomatic complexity: ≤ 10 per function

**Review Process:**
- All code changes via pull request
- At least one reviewer approval
- CI must pass (tests, lint, type check)
- No force pushes to main branch

### 8.7 Security

**Requirements:**
- No known vulnerabilities in dependencies
- Regular `npm audit` scans
- Dependabot alerts enabled
- XML bomb protection (limit depth, element count)
- No arbitrary code execution
- Validate all file paths (prevent directory traversal)

**XML Security:**
- Disable entity expansion (XXE protection)
- Limit XML document size
- Limit nesting depth
- Timeout for schema fetching

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up project infrastructure and core validation.

**Deliverables:**
- ✓ Repository setup (package.json, tsconfig, etc.)
- ✓ Build system (tsup for dual CJS/ESM builds)
- ✓ Test framework (Vitest)
- ✓ Linting and formatting (ESLint, Prettier)
- ✓ CI pipeline (GitHub Actions: test, lint, build)
- ✓ Core XML validation wrapper (libxmljs2 integration)
- ✓ Schema loading and caching
- ✓ Error extraction and normalization

**Testing:**
- Unit tests for core validation
- Test with basic XSD schemas

**Documentation:**
- Basic README with project setup

---

### Phase 2: SDC4 Core (Weeks 3-4)

**Goal:** Implement SDC4-specific functionality.

**Deliverables:**
- ✓ ExceptionalValueType enum and metadata
- ✓ ErrorMapper class with default rules
- ✓ Pattern-based error classification (all 7 rule categories)
- ✓ InstanceModifier for XML DOM manipulation
- ✓ ExceptionalValue element injection
- ✓ Namespace handling

**Testing:**
- Unit tests for ErrorMapper (12+ tests)
- Unit tests for InstanceModifier
- Integration tests with real SDC4 schema
- Test all 15 ExceptionalValue types

**Documentation:**
- Error Mapping guide
- Architecture documentation

---

### Phase 3: SDC4Validator API (Weeks 5-6)

**Goal:** Build the main SDC4Validator class and API.

**Deliverables:**
- ✓ SDC4Validator class
- ✓ validateWithRecovery() method
- ✓ iterErrorsWithMapping() method
- ✓ validateAndReport() method
- ✓ saveRecoveredXML() method
- ✓ Convenience functions (validateWithRecovery, isValid, iterErrors)
- ✓ File I/O operations
- ✓ Complete TypeScript type definitions

**Testing:**
- Unit tests for each SDC4Validator method
- Integration tests with real workflows
- Test with StatePopulation example from Python package

**Documentation:**
- Complete API documentation (TypeDoc)
- Usage examples for all methods

---

### Phase 4: CLI Implementation (Weeks 7-8)

**Goal:** Build command-line interface.

**Deliverables:**
- ✓ CLI framework setup (Commander)
- ✓ `sdcvalidate` command with all options
- ✓ Commands: validate, recover, report, check
- ✓ File path handling
- ✓ Exit code handling
- ✓ Help text and version display
- ✓ Error formatting for CLI

**Testing:**
- CLI integration tests
- Test all command combinations
- Test error cases (file not found, invalid schema, etc.)

**Documentation:**
- CLI Usage guide
- Man page (optional)
- Help text in CLI

---

### Phase 5: Polish & Release (Weeks 9-10)

**Goal:** Production-ready release.

**Deliverables:**
- ✓ Complete test coverage (≥90% line coverage)
- ✓ Performance benchmarks
- ✓ Memory leak testing
- ✓ Security audit (npm audit, Snyk)
- ✓ Complete documentation
  - Getting Started guide
  - Advanced Usage guide
  - Troubleshooting guide
  - Migration from Python guide (for users familiar with Python version)
- ✓ Examples directory with runnable code
- ✓ CHANGELOG.md
- ✓ LICENSE file
- ✓ Comprehensive README.md
- ✓ NPM package preparation
  - Package metadata
  - Keywords for discoverability
  - Repository links
- ✓ GitHub repository cleanup
  - Issue templates
  - Contributing guidelines
  - Code of conduct

**Testing:**
- Full regression test suite
- Cross-platform testing (Linux, macOS, Windows)
- Node.js version testing (18.x, 20.x, 22.x)

**Release:**
- v4.0.0 release to npm
- GitHub release with release notes
- Announcement (if applicable)

---

### Timeline Summary

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1: Foundation** | Weeks 1-2 | Core validation working |
| **Phase 2: SDC4 Core** | Weeks 3-4 | Error mapping and recovery |
| **Phase 3: SDC4Validator API** | Weeks 5-6 | Full API implementation |
| **Phase 4: CLI** | Weeks 7-8 | CLI tool ready |
| **Phase 5: Polish & Release** | Weeks 9-10 | v1.0.0 released |

**Total Duration:** 10 weeks (2.5 months)

**Buffer:** Add 2 weeks for contingency (12 weeks total recommended)

---

## 10. Success Criteria

### 10.1 Feature Completeness

✅ **v4.0.0 is complete when:**

- [ ] All Phase 1-5 deliverables implemented
- [ ] SDC4Validator API matches functional requirements (FR-1 through FR-8)
- [ ] CLI implements all specified commands (FR-9)
- [ ] All 15 ExceptionalValue types supported
- [ ] All 7 error classification rules implemented
- [ ] Namespace handling works correctly
- [ ] File I/O operations robust

### 10.2 Quality Metrics

✅ **Quality standards met when:**

- [ ] Test coverage ≥ 90% line coverage
- [ ] All tests passing on Linux, macOS, Windows
- [ ] ESLint: 0 errors, 0 warnings
- [ ] TypeScript: 0 errors in strict mode
- [ ] npm audit: 0 high/critical vulnerabilities
- [ ] Performance benchmarks within targets
- [ ] Memory leak testing passed

### 10.3 Documentation Completeness

✅ **Documentation complete when:**

- [ ] README.md with installation, quick start, examples
- [ ] API documentation (TypeDoc) for all public APIs
- [ ] Getting Started guide published
- [ ] Error Mapping guide published
- [ ] CLI Usage guide published
- [ ] Advanced Usage guide published
- [ ] Examples directory with 5+ runnable examples
- [ ] CHANGELOG.md with v4.0.0 entry

### 10.4 User Acceptance

✅ **Ready for users when:**

- [ ] Package installable via `npm install sdcvalidator`
- [ ] Works in fresh Node.js 18+ environment
- [ ] CLI works after `npm install -g sdcvalidator`
- [ ] Can validate StatePopulation example from Python package
- [ ] Validation results match Python package output (for same inputs)
- [ ] Clear error messages for common mistakes

### 10.5 Release Checklist

✅ **Ready to publish when:**

- [ ] All above criteria met
- [ ] package.json metadata complete (description, keywords, repository, etc.)
- [ ] LICENSE file present (MIT)
- [ ] .npmignore configured (exclude tests, examples, docs source)
- [ ] Semantic versioning adopted (4.0.0 - following SDC ecosystem convention)
- [ ] Git tags for releases
- [ ] GitHub Actions publish workflow configured
- [ ] Test npm package locally (`npm pack`, install in separate project)

---

## 11. Out of Scope

**Explicitly excluded from v4.0.0:**

### 11.1 JSON Conversion
- XML-to-JSON conversion
- JSON-to-XML conversion
- Multiple converter strategies (Parker, BadgerFish, etc.)

**Reason:** Core validation is sufficient for v4.0. JSON conversion can be v4.1+ feature.

### 11.2 Browser Support
- Browser/WASM builds
- Client-side validation
- React/Vue/Angular integration libraries

**Reason:** Server-side Node.js focus for v4.0. Browser support is complex (different XML libraries, bundle size concerns).

### 11.3 Advanced Features
- Streaming validation for large files
- Batch validation of multiple files
- Watch mode for development
- Plugin system for extensibility
- Custom ExceptionalValue templates
- WSDL support
- Code generation from schemas

**Reason:** These are advanced features that can be added based on user feedback after v4.0.

### 11.4 Alternative Validation Backends
- Pure JavaScript XSD validator (no native dependencies)
- WASM-based validator
- Alternative XML parsers (beyond libxmljs2)

**Reason:** libxmljs2 is proven and performant. Alternatives add complexity without clear benefit for v4.0.

### 11.5 Web UI
- Web-based validation interface
- REST API server
- GraphQL API

**Reason:** These are separate products. v4.0 is a library and CLI tool.

### 11.6 Additional Data Formats
- RELAX NG schema support
- DTD validation
- Schematron validation
- Non-XML formats (JSON Schema, Protobuf, etc.)

**Reason:** SDC4 is XML/XSD-based. Other formats are out of scope.

---

## 12. Dependencies

### 12.1 Required Dependencies (package.json)

```json
{
  "dependencies": {
    "libxmljs2": "^0.33.0",
    "xpath": "^0.0.34",
    "@xmldom/xmldom": "^0.8.10",
    "commander": "^12.0.0"
  }
}
```

**Justification:**

- **libxmljs2** - Fast XSD 1.1 validator with C++ bindings
- **xpath** - XPath 1.0 evaluation for error locations
- **@xmldom/xmldom** - DOM manipulation for ExceptionalValue injection
- **commander** - CLI argument parsing (industry standard)

### 12.2 Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^20.0.0",
    "@types/xpath": "^0.0.34",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "prettier": "^3.3.0",
    "typedoc": "^0.26.0",
    "tsx": "^4.19.0"
  }
}
```

### 12.3 Dependency Management

**Policies:**
- Pin major versions, allow minor/patch updates (^x.y.z)
- Monthly dependency updates (Dependabot)
- Security vulnerability scanning (npm audit, Snyk)
- Avoid dependencies with known CVEs
- Prefer well-maintained libraries (last commit < 6 months)
- Minimize dependency tree depth

### 12.4 Alternative Dependencies Considered

| Need | Chosen | Alternatives | Decision Rationale |
|------|--------|--------------|-------------------|
| XSD Validation | libxmljs2 | xsd-schema-validator, libxml-xsd | Native performance, XSD 1.1, active maintenance |
| XPath | xpath | xpath.js, fontoxpath | Lightweight, sufficient for XPath 1.0 |
| DOM | @xmldom/xmldom | jsdom, cheerio | Standard DOM API, XML-focused |
| CLI | commander | yargs, cac | Mature, widely used, clear API |
| Testing | Vitest | Jest, Mocha | Fast, TypeScript-first, modern |
| Bundler | tsup | Rollup, esbuild | Optimized for libraries, dual builds |

---

## 13. Risks and Mitigations

### 13.1 Technical Risks

#### Risk 1: libxmljs2 Native Dependency Issues

**Description:** libxmljs2 requires C++ compilation, which can fail on some systems (especially Windows).

**Impact:** HIGH - Users cannot install package
**Likelihood:** MEDIUM

**Mitigation:**
- Include pre-built binaries where possible (libxmljs2 provides these)
- Document system requirements (C++ compiler, Python for node-gyp)
- Provide troubleshooting guide for installation issues
- Consider fallback to pure JS validator in future (v2.0+)

**Fallback Plan:**
- If installation issues widespread, evaluate pure JS alternatives
- Provide Docker image for consistent environment

---

#### Risk 2: XPath Expression Complexity

**Description:** Complex XPath expressions for error location may fail or be incorrect.

**Impact:** MEDIUM - Errors not located correctly
**Likelihood:** LOW

**Mitigation:**
- Thorough testing with diverse XML structures
- Use simple XPath expressions where possible
- Validate XPath results in tests
- Document XPath limitations

**Fallback Plan:**
- Fall back to parent element if exact location unavailable

---

#### Risk 3: XML Namespace Edge Cases

**Description:** Complex namespace scenarios may not be handled correctly.

**Impact:** MEDIUM - ExceptionalValues injected incorrectly
**Likelihood:** MEDIUM

**Mitigation:**
- Comprehensive namespace testing (default namespace, multiple namespaces, prefixes)
- Study Python implementation carefully
- Use namespace-aware DOM methods
- Test with real-world SDC4 examples

**Fallback Plan:**
- Document known namespace limitations
- Provide workarounds for edge cases

---

### 13.2 Schedule Risks

#### Risk 4: Underestimated Complexity

**Description:** Implementation takes longer than 10 weeks.

**Impact:** MEDIUM - Delayed release
**Likelihood:** MEDIUM

**Mitigation:**
- Include 2-week buffer (12 weeks total)
- Prioritize core features (de-scope if needed)
- Weekly progress reviews
- Early identification of blockers

**Fallback Plan:**
- Release v4.0.0-beta if core features done but polish incomplete
- Defer CLI to v4.0.1 if needed

---

#### Risk 5: Dependency on External Resources

**Description:** Delays due to waiting for external input (schema examples, clarifications).

**Impact:** LOW - Minor delays
**Likelihood:** LOW

**Mitigation:**
- Use Python package examples as reference
- Self-sufficient implementation based on spec
- Document assumptions for later validation

---

### 13.3 Quality Risks

#### Risk 6: Insufficient Test Coverage

**Description:** Test coverage below 90% target.

**Impact:** MEDIUM - Bugs in production
**Likelihood:** LOW

**Mitigation:**
- Continuous coverage monitoring (Vitest + coverage-v8)
- Code review checklist includes test coverage
- Fail CI if coverage drops below 85%
- Focus on critical paths first

---

#### Risk 7: Platform-Specific Bugs

**Description:** Code works on one OS but fails on another.

**Impact:** MEDIUM - Users on specific platforms cannot use package
**Likelihood:** LOW

**Mitigation:**
- CI testing on Linux, macOS, Windows
- File path handling with `path` module
- Use cross-platform dependencies
- Test on multiple Node.js versions

---

### 13.4 User Adoption Risks

#### Risk 8: Unclear Documentation

**Description:** Users don't understand how to use the package.

**Impact:** HIGH - Low adoption
**Likelihood:** MEDIUM

**Mitigation:**
- Comprehensive examples
- Step-by-step guides
- Clear API documentation
- Beginner-friendly README
- User testing with non-Node.js experts

**Fallback Plan:**
- Collect user feedback early
- Iterate on documentation based on questions
- Provide video tutorial if needed

---

#### Risk 9: Performance Issues

**Description:** Validation too slow for production use.

**Impact:** MEDIUM - Users seek alternatives
**Likelihood:** LOW

**Mitigation:**
- Performance benchmarks from day 1
- Native C++ validation (libxmljs2) is fast
- Schema caching
- Lazy error iteration
- Profile and optimize hot paths

**Fallback Plan:**
- Streaming validation for large files (v4.1.0)
- Parallel validation (v4.2.0)

---

## 14. Appendices

### Appendix A: ExceptionalValue Types Reference

| Code | Name | Description | Common Use Cases |
|------|------|-------------|------------------|
| **INV** | Invalid | Value does not conform to expected type/format | Type errors, pattern mismatches, constraint violations |
| **OTH** | Other | Value is valid but doesn't match expected enumeration | Enumeration violations, unexpected but valid values |
| **NI** | No Information | Required value is missing | Missing required elements/attributes |
| **NA** | Not Applicable | Content present but not expected in this context | Unexpected elements, extra data |
| **UNC** | Unencoded | Value contains invalid characters or encoding | Encoding errors, whitespace issues |
| **UNK** | Unknown | Value explicitly marked as unknown | Domain-specific "unknown" values |
| **ASKU** | Asked but Unknown | Data was requested but respondent didn't know | Survey data, questionnaire responses |
| **ASKR** | Asked and Refused | Data was requested but respondent refused | Privacy-sensitive data, voluntary refusals |
| **NASK** | Not Asked | Data was not requested | Partial data collection scenarios |
| **NAV** | Not Available | Data not currently available | Temporary unavailability, pending data |
| **MSK** | Masked | Data hidden for privacy/security | Protected health information, PII |
| **DER** | Derived | Value calculated from other values | Computed fields, aggregations |
| **PINF** | Positive Infinity | Numeric value exceeds maximum | Overflow conditions |
| **NINF** | Negative Infinity | Numeric value below minimum | Underflow conditions |
| **TRC** | Trace | Value present in trace amounts | Scientific measurements |

### Appendix B: Error Mapping Patterns

**Pattern Priority:** First match wins (rules evaluated in order below)

#### 1. Missing Required → NI
```
missing required
required .* is missing
element .* is required
content .* is not complete
minimum .* is \d+
```

#### 2. Type Violations → INV
```
not a valid value
invalid value
is not valid for type
type .* does not match
cannot be converted
expected type
wrong type
invalid.*format
malformed
```

#### 3. Constraint Violations → INV
```
pattern.*not matched
does not match pattern
length constraint
minlength|maxlength
mininclusive|maxinclusive
minexclusive|maxexclusive
totaldigits|fractiondigits
assertion.*failed
constraint.*violated
exceeds.*maximum
below.*minimum
```

#### 4. Enumeration Violations → OTH
```
not in enumeration
not.*allowed value
not.*permitted value
invalid enumeration
value.*not.*allowed
```

#### 5. Unexpected Content → NA
```
unexpected
not allowed
not permitted
extra element
unknown element
element.*not expected
```

#### 6. Encoding Errors → UNC
```
encoding error
decode error
character.*not.*allowed
invalid character
whitespace
```

#### 7. Default Fallback → NI

### Appendix C: Glossary

**SDC (Semantic Data Charter):** A data modeling framework that extends XML Schema with data quality management features.

**ExceptionalValue:** An XML element injected into a document to flag data quality issues while preserving the original data.

**Quarantine-and-Tag:** A pattern where invalid data is preserved (quarantined) and annotated with quality flags (tagged) rather than rejected.

**ISO 21090:** International standard for healthcare data types, which defines the 15 ExceptionalValue types.

**XSD (XML Schema Definition):** A language for defining the structure and data types of XML documents.

**XPath:** A query language for selecting nodes in XML documents.

**DOM (Document Object Model):** A programming interface for XML and HTML documents.

**ESM (ES Modules):** Modern JavaScript module system using `import`/`export` syntax.

**CommonJS:** Legacy Node.js module system using `require()`/`module.exports`.

**TypeScript:** Superset of JavaScript with static type checking.

### Appendix D: References

1. **Python sdcvalidator Package:** `/home/twcook/GitHub/sdcvalidator`
2. **Semantic Data Charter Specification:** https://semanticdatacharter.com/
3. **ISO 21090 Standard:** Healthcare data types and ExceptionalValue definitions
4. **XML Schema 1.1 Specification:** https://www.w3.org/TR/xmlschema11-1/
5. **XPath 1.0 Specification:** https://www.w3.org/TR/xpath-10/
6. **libxmljs2 Documentation:** https://github.com/marudor/libxmljs2
7. **TypeScript Handbook:** https://www.typescriptlang.org/docs/

### Appendix E: Open Questions

**For Clarification:**

1. **Schema Distribution:** Should we bundle SDC4 schemas with the package, or expect users to provide their own?
   - **Recommendation:** Let users provide schemas (more flexible)

2. **Error Severity Levels:** Should we classify errors by severity (error vs. warning)?
   - **Recommendation:** Defer to v4.1+ (not in Python version)

3. **Custom ExceptionalValue Content:** Should users be able to customize the content of ExceptionalValue elements beyond type and name?
   - **Recommendation:** Defer to v4.1+ (use Python version defaults)

4. **Performance Targets:** Are the performance targets realistic for Node.js?
   - **Recommendation:** Benchmark Python version and aim for similar performance

5. **Namespace Prefix Conflicts:** How to handle documents that already use the configured prefix?
   - **Recommendation:** Throw error, require user to configure different prefix

---

## End of PRD

**Next Steps:**

1. Review and approve this PRD
2. Set up GitHub repository with project structure
3. Begin Phase 1 implementation
4. Weekly progress reviews against timeline
5. Adjust scope/timeline as needed based on progress

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2025-10-28 | Axius SDC, Inc. | Initial draft for SDC Release 4 |

---

**Approval Signatures:**

- [ ] Product Owner: _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______
- [ ] Stakeholder: ___________________ Date: _______
