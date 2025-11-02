# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sdcvalidatorJS** is a production-ready TypeScript/Node.js implementation of SDC4 (Semantic Data Charter version 4) validation with **automatic ExceptionalValue injection** for data quality management.

**Purpose**: JavaScript/TypeScript port of the Python sdcvalidator, implementing the SDC4 "quarantine-and-tag" pattern for browser and Node.js environments.

**Status**: Production/Stable (v4.0.0)

---

## Key Concepts

### The SDC4 ExceptionalValue Recovery Pattern

Unlike traditional XML validators that **reject** invalid data, sdcvalidatorJS:

1. **Preserves** all submitted data (even invalid)
2. **Injects** ExceptionalValue elements to flag errors
3. **Classifies** errors into 15 ISO 21090 NULL Flavor types
4. **Enables** downstream data quality tracking and forensic analysis

**Example**:

```xml
<!-- Invalid input -->
<AdultPopulation>
    <xdcount-value>not_a_number</xdcount-value>
</AdultPopulation>

<!-- After recovery -->
<AdultPopulation>
    <sdc4:INV>  <!-- ExceptionalValue inserted -->
        <sdc4:ev-name>Invalid</sdc4:ev-name>
        <!-- Error: not a valid integer value -->
    </sdc4:INV>
    <xdcount-value>not_a_number</xdcount-value>  <!-- Preserved -->
</AdultPopulation>
```

### Relationship to SDC4 Ecosystem

sdcvalidatorJS is the **JavaScript/TypeScript equivalent** of the Python sdcvalidator:

- **[SDCRM](https://github.com/SemanticDataCharter/SDCRM)** v4.0.0 - Reference model and schemas
- **[SDCStudio](https://github.com/AxiusSDC/SDCStudio)** v4.0.0 - Web application (Django + React)
- **[sdcvalidator (Python)](https://github.com/Axius-SDC/sdcvalidator)** v4.0.1 - Python implementation
- **[sdcvalidatorJS](https://github.com/Axius-SDC/sdcvalidatorJS)** v4.0.0 - This library (Node.js/browser)
- **[Obsidian Template](https://github.com/SemanticDataCharter/SDCObsidianTemplate)** v4.0.0 - Markdown templates

**All use version 4.x.x** - The MAJOR version (4) represents SDC generation.

---

## Repository Structure

```
sdcvalidatorJS/
├── src/
│   ├── core/               # Core XML validation
│   │   ├── validator.ts    # Base XML Schema validation
│   │   └── schemas.ts      # Schema loading and caching
│   ├── sdc4/               # SDC4-specific functionality
│   │   ├── validator.ts    # SDC4Validator class (main API)
│   │   ├── error-mapper.ts # Error → ExceptionalValue mapping
│   │   ├── recovery.ts     # XML tree modification
│   │   └── types.ts        # ExceptionalValue type definitions
│   ├── utils/              # Utilities
│   │   ├── xml.ts          # XML parsing and serialization
│   │   └── xpath.ts        # XPath helpers
│   ├── cli/                # Command-line interface
│   │   └── cli.ts          # CLI implementation
│   └── index.ts            # Public API exports
├── tests/                  # Test suite (182 tests)
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
├── docs/                   # Documentation
│   ├── guides/             # Usage guides
│   └── api/                # API reference
├── examples/               # Working examples
├── package.json            # Package metadata
├── tsconfig.json           # TypeScript configuration
├── vitest.config.ts        # Test configuration
└── tsup.config.ts          # Build configuration
```

---

## Technology Stack

### Core Technologies

- **TypeScript 5.6+** - Type-safe JavaScript
- **Node.js 18+** - Runtime environment
- **@xmldom/xmldom** - XML parsing and DOM manipulation
- **xpath** - XPath evaluation
- **xsd-schema-validator** - XSD validation (optional dependency)
- **commander** - CLI framework

### Development Tools

- **Vitest** - Testing framework (182 tests, 90.4% coverage)
- **tsup** - TypeScript bundler (ESM + CJS + types)
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeDoc** - API documentation generation

---

## Development Setup

### Prerequisites

- **Node.js 18.x or higher**
- **npm 9.x or higher**
- **git**

### Setup Steps

```bash
# Clone repository
git clone https://github.com/Axius-SDC/sdcvalidatorJS.git
cd sdcvalidatorJS

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run in development mode
npm run dev
```

### Package Exports

The package provides **dual ESM/CJS** exports:

```json
{
  "import": "./dist/esm/index.js",    // ESM
  "require": "./dist/cjs/index.cjs"   // CommonJS
}
```

---

## Coding Standards

### TypeScript Style

- **Strict mode enabled** - `strict: true` in tsconfig.json
- **No implicit any** - All types must be explicit
- **Interface over type** - Prefer `interface` for object shapes
- **Naming conventions**:
  - Classes: `PascalCase`
  - Interfaces: `PascalCase` (no `I` prefix)
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Private members: `_leadingUnderscore` or `#privateField`

### Code Formatting

```typescript
// ✅ GOOD
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  exceptionalValueCounts: Record<ExceptionalValueType, number>;
}

export class SDC4Validator {
  private schema: XMLSchema;

  constructor(options: ValidatorOptions) {
    this.schema = loadSchema(options.schemaPath);
  }

  async validateWithRecovery(instancePath: string): Promise<RecoveredDocument> {
    const doc = await this.parseXML(instancePath);
    const errors = await this.validate(doc);
    return this.injectExceptionalValues(doc, errors);
  }
}
```

### Documentation Style

Use **TSDoc** for all public APIs:

```typescript
/**
 * Validates an XML instance against the SDC4 schema and injects ExceptionalValues
 * for any validation errors found.
 *
 * @param instancePath - Path to XML instance file
 * @returns Recovered document with ExceptionalValue elements
 * @throws {ValidationError} If XML is malformed
 * @throws {SchemaError} If schema cannot be loaded
 *
 * @example
 * ```typescript
 * const validator = new SDC4Validator({ schema: './schema.xsd' });
 * const recovered = await validator.validateWithRecovery('./data.xml');
 * await validator.saveRecoveredXML('./recovered.xml', recovered);
 * ```
 */
async validateWithRecovery(instancePath: string): Promise<RecoveredDocument> {
  // Implementation
}
```

---

## Testing Strategy

### Test Organization

```
tests/
├── unit/
│   ├── core/           # Core validation tests
│   ├── sdc4/           # SDC4-specific tests
│   └── utils/          # Utility tests
├── integration/
│   ├── validator.test.ts    # End-to-end validation
│   ├── recovery.test.ts     # Recovery workflow
│   └── cli.test.ts          # CLI tests
└── fixtures/
    ├── schemas/        # Test XSD schemas
    └── instances/      # Test XML instances
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test
npm test -- error-mapper

# Debug tests
node --inspect-brk node_modules/.bin/vitest
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SDC4Validator } from '../src/sdc4/validator';

describe('SDC4Validator', () => {
  let validator: SDC4Validator;

  beforeEach(() => {
    validator = new SDC4Validator({
      schema: './tests/fixtures/schemas/test.xsd'
    });
  });

  it('should inject INV ExceptionalValue for invalid integer', async () => {
    const recovered = await validator.validateWithRecovery(
      './tests/fixtures/instances/invalid-integer.xml'
    );

    const invElements = recovered.getElementsByTagName('INV');
    expect(invElements.length).toBe(1);
    expect(invElements[0].textContent).toContain('Invalid');
  });
});
```

### Test Coverage Requirements

- **Minimum**: 85% overall coverage
- **SDC4 module**: 90% coverage (critical functionality)
- **New features**: 100% coverage required

---

## Build and Distribution

### Building the Package

```bash
# Build for production
npm run build

# Output structure:
# dist/
#   ├── esm/          # ES Modules
#   ├── cjs/          # CommonJS
#   └── types/        # TypeScript definitions
```

### Package Configuration (tsup)

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts', 'src/cli/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,  // Generate .d.ts files
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false
});
```

### Publishing to npm

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Run prepublish checks (automatic)
# - npm run lint
# - npm run typecheck
# - npm run test

# 3. Build package
npm run build

# 4. Publish
npm publish

# 5. Tag release on GitHub
git tag v4.0.1
git push origin --tags
```

---

## Versioning Strategy

sdcvalidatorJS follows **semantic versioning** aligned with SDC4 ecosystem:

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR** (4.x.x): Matches SDC generation (SDC4 = 4.x.x)
- **MINOR** (4.X.0): New features, backward-compatible
- **PATCH** (4.0.X): Bug fixes, documentation

**Current**: v4.0.0

**When to bump**:
- **MAJOR**: Breaking API changes, incompatible with SDC4 (would mean SDC5)
- **MINOR**: New ExceptionalValue types, new API methods
- **PATCH**: Bug fixes, documentation, performance improvements

---

## API Design Principles

### TypeScript-First

```typescript
// Excellent IDE support with full types
import { SDC4Validator, type ValidationResult } from 'sdcvalidator';

const validator = new SDC4Validator({ schema: './schema.xsd' });
const result: ValidationResult = await validator.validateAndReport('./data.xml');
//    ^-- TypeScript knows all properties
```

### Async by Default

All I/O operations are asynchronous:

```typescript
// ✅ GOOD - Async
await validator.validateWithRecovery('./data.xml');

// ❌ BAD - Sync would block event loop
validator.validateWithRecoverySync('./data.xml');
```

### Builder Pattern for Options

```typescript
const validator = new SDC4Validator({
  schema: './schema.xsd',
  errorMapper: customMapper,
  xmlParserOptions: {
    locator: true,
    xmlns: true
  }
});
```

---

## CLI Implementation

### CLI Structure

```typescript
// src/cli/cli.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('sdcvalidate')
  .description('SDC4 validator with ExceptionalValue recovery')
  .version('4.0.0');

program
  .argument('<instance>', 'XML instance file to validate')
  .option('-s, --schema <path>', 'XSD schema file')
  .option('--recover', 'Enable ExceptionalValue recovery')
  .option('-o, --output <path>', 'Output file for recovered XML')
  .action(async (instance, options) => {
    // Implementation
  });

program.parse();
```

### CLI Usage

```bash
# Basic validation
sdcvalidate data.xml --schema schema.xsd

# With recovery
sdcvalidate data.xml -s schema.xsd --recover -o recovered.xml

# Generate report
sdcvalidate data.xml -s schema.xsd --report > report.json

# Check validity (exit code)
sdcvalidate data.xml -s schema.xsd --check && echo "Valid!"
```

---

## Integration with SDC4 Ecosystem

### Python sdcvalidator Parity

sdcvalidatorJS provides **equivalent functionality** to Python sdcvalidator:

| Feature | Python | JavaScript |
|---------|--------|------------|
| XML Schema 1.1 validation | ✅ | ✅ |
| ExceptionalValue injection | ✅ | ✅ |
| 15 ISO 21090 types | ✅ | ✅ |
| CLI tool | ✅ | ✅ |
| Async API | ✅ | ✅ |
| Type definitions | ⚠️ (type hints) | ✅ (TypeScript) |

### Browser Support

**Note**: Currently Node.js only. Browser support planned for future:

```typescript
// Future browser API
import { SDC4Validator } from 'sdcvalidator/browser';

const validator = new SDC4Validator({
  schema: await fetch('./schema.xsd').then(r => r.text())
});
```

### Integration with SDCStudio

SDCStudio's React frontend can use sdcvalidatorJS:

```typescript
// In React component
import { SDC4Validator } from 'sdcvalidator';

async function validateUpload(file: File) {
  const validator = new SDC4Validator({ schema: schemaPath });
  const text = await file.text();
  const report = await validator.validateAndReport(text);
  return report;
}
```

---

## Common Development Tasks

### Adding New ExceptionalValue Type

1. **Define type** in `src/sdc4/types.ts`
   ```typescript
   export enum ExceptionalValueType {
     INV = 'INV',
     // ... existing types
     NEW = 'NEW'  // Add new type
   }
   ```

2. **Add mapping rule** in `src/sdc4/error-mapper.ts`
   ```typescript
   private mapErrorToType(error: ValidationError): ExceptionalValueType {
     if (this.isNewTypeError(error)) return ExceptionalValueType.NEW;
     // ... existing mappings
   }
   ```

3. **Add tests** in `tests/unit/sdc4/error-mapper.test.ts`

4. **Update documentation** in README and docs/

### Debugging Tips

```typescript
// Enable verbose logging
const validator = new SDC4Validator({
  schema: './schema.xsd',
  verbose: true  // Logs all validation steps
});

// Use debugger
import { debuglog } from 'util';
const debug = debuglog('sdcvalidator');
debug('Processing error:', error);
```

### Performance Optimization

```typescript
// Cache schemas
const schemaCache = new Map<string, XMLSchema>();

// Reuse validator instances
const validator = new SDC4Validator({ schema: './schema.xsd' });
for (const file of files) {
  await validator.validateWithRecovery(file);  // Reuse
}

// Stream large files (future enhancement)
```

---

## Dependencies

### Core Dependencies

- **@xmldom/xmldom** (0.8.10+) - XML parsing and DOM
- **xpath** (0.0.34+) - XPath evaluation
- **commander** (12.0.0+) - CLI framework

### Optional Dependencies

- **xsd-schema-validator** (0.11.0+) - XSD validation (faster than pure JS)

### Development Dependencies

- **TypeScript** (5.6.0+)
- **Vitest** (2.0.0+) - Testing
- **tsup** (8.0.0+) - Bundling
- **ESLint** (9.0.0+) - Linting
- **Prettier** (3.3.0+) - Formatting
- **TypeDoc** (0.26.0+) - Documentation

---

## Differences from Python Implementation

| Aspect | Python (sdcvalidator) | JavaScript (sdcvalidatorJS) |
|--------|----------------------|----------------------------|
| **Runtime** | Python 3.9+ | Node.js 18+ |
| **XML Library** | lxml (C extension) | @xmldom/xmldom (pure JS) |
| **Type System** | Type hints (runtime optional) | TypeScript (compile-time) |
| **Async Model** | sync + async | async-first |
| **Package Manager** | pip/PyPI | npm |
| **Module System** | Standard Python imports | ESM + CJS |
| **CLI** | Entry point script | Commander.js |
| **Performance** | Faster (C extensions) | Slower (pure JS) |

---

## Documentation

### User Documentation

- **README.md** - Quick start and overview
- **docs/guides/** - Comprehensive guides
  - getting-started.md
  - error-mapping.md
  - cli-usage.md
  - advanced-usage.md
- **docs/api/** - API reference (generated by TypeDoc)

### Developer Documentation

- **CLAUDE.md** (this file) - Developer guide
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policy
- **PRD.md** - Product Requirements Document

---

## Testing and CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
- Run tests on Node.js 18.x, 20.x, 22.x
- Run on ubuntu-latest, windows-latest, macos-latest
- Coverage reporting
- Lint and type check
- Build verification
```

### Pre-commit Checks

Enforced via `prepublishOnly` script:
1. Lint with ESLint
2. Type check with TypeScript
3. Run full test suite
4. Only then allow publish

---

## Important Notes

### What sdcvalidatorJS Does

✅ Validates XML against XML Schema 1.1 (via xsd-schema-validator or pure JS)
✅ Injects ExceptionalValue elements for SDC4 data quality tracking
✅ Classifies errors using ISO 21090 NULL Flavor taxonomy
✅ Provides TypeScript-first API with excellent IDE support
✅ Offers CLI tool for command-line workflows
✅ Dual ESM/CJS distribution for maximum compatibility

### What sdcvalidatorJS Does NOT Do

❌ Generate SDC4 schemas (use SDCStudio)
❌ Create SDC4 data models from scratch (use SDCStudio)
❌ Provide UI for validation (use SDCStudio web app)
❌ Modify or "fix" invalid data automatically (preserves for auditing)
❌ Run in browser (currently Node.js only)

---

## Getting Help

- **GitHub Issues** - https://github.com/Axius-SDC/sdcvalidatorJS/issues
- **GitHub Discussions** - https://github.com/Axius-SDC/sdcvalidatorJS/discussions
- **Email** - contact@axius-sdc.com
- **Python Version** - https://github.com/Axius-SDC/sdcvalidator (reference implementation)

---

## License

**MIT License** - See LICENSE file

**Copyright** (c) 2025 Axius-SDC, Inc.

---

**Remember**: sdcvalidatorJS enables data quality tracking through the SDC4 ExceptionalValue pattern. Invalid data is preserved and flagged, not rejected.
