# API Reference

Complete API documentation for sdcvalidator.

## Core Classes

### SDC4Validator

Main validator class for SDC4 validation with ExceptionalValue recovery.

```typescript
class SDC4Validator {
  constructor(options: SDC4ValidatorOptions);
  validateWithRecovery(xml: XMLSource, options?: RecoveryOptions): Promise<Document>;
  validateAndReport(xml: XMLSource): Promise<ValidationReport>;
  saveRecoveredXML(outputPath: string, xml: XMLSource, options?: SaveOptions): Promise<void>;
  iterErrorsWithMapping(xml: XMLSource): AsyncGenerator<ValidationErrorWithMapping>;
  getErrorMapper(): ErrorMapper;
  getInstanceModifier(): InstanceModifier;
  getValidationMode(): ValidationMode;
}
```

### ErrorMapper

Maps validation errors to ExceptionalValue types using pattern-based rules.

```typescript
class ErrorMapper {
  constructor();
  addRule(condition: RuleCondition, evType: ExceptionalValueType, priority: number): void;
  mapError(error: ValidationError): ExceptionalValueType;
  getRuleCount(): number;
}
```

### InstanceModifier

Injects ExceptionalValue elements into XML DOM.

```typescript
class InstanceModifier {
  constructor(namespacePrefix?: string);
  injectExceptionalValues(doc: Document, errors: ErrorLocation[]): Document;
  setNamespacePrefix(prefix: string): void;
  getNamespacePrefix(): string;
}
```

## Convenience Functions

```typescript
// Quick validity check
function isValid(schemaPath: string, xmlPath: string): Promise<boolean>

// Validate with recovery
function validateWithRecovery(
  schemaPath: string,
  xmlPath: string,
  outputPath?: string,
  options?: ValidateOptions
): Promise<Document>

// Iterate over errors
function* iterErrors(
  schemaPath: string,
  xmlPath: string
): AsyncGenerator<ValidationErrorWithMapping>
```

## Utility Functions

### XML Utilities

```typescript
function parseXML(source: XMLSource): Promise<Document>
function serializeXML(doc: Document, options?: SerializeOptions): string
function cloneDocument(doc: Document): Document
function isFilePath(str: string): boolean
```

### XPath Utilities

```typescript
function selectNodes(expression: string, contextNode: Document | Element): Element[]
function selectSingleNode(expression: string, contextNode: Document | Element): Element | undefined
function getElementPath(element: Element): string
function selectValue(expression: string, contextNode: Document | Element): string
```

### Namespace Utilities

```typescript
function ensureSDC4Namespace(doc: Document, prefix?: string): string
function createNamespacedElement(doc: Document, tagName: string, prefix?: string): Element
function isExceptionalValueElement(element: Element): boolean
function removeExceptionalValues(doc: Document): void
function getPrefix(qname: string): string | undefined
function getLocalName(qname: string): string
```

## Constants

```typescript
enum ExceptionalValueType {
  INV, OTH, NI, NA, UNC, UNK, ASKU, ASKR,
  NASK, NAV, MSK, DER, PINF, NINF, TRC
}

const SDC4_NAMESPACE = 'https://semanticdatacharter.com/ns/sdc4/';
const DEFAULT_NAMESPACE_PREFIX = 'sdc4';
```

## Resources

- [Getting Started](../guides/getting-started.md)
- [Error Mapping](../guides/error-mapping.md)
- [CLI Usage](../guides/cli-usage.md)
- [Advanced Usage](../guides/advanced-usage.md)
- [Examples](../../examples/)
