# sdcvalidator

[![npm version](https://img.shields.io/npm/v/sdcvalidator.svg)](https://www.npmjs.com/package/sdcvalidator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/sdcvalidator.svg)](https://nodejs.org)

SDC4 (Semantic Data Charter Release 4) validator with ExceptionalValue recovery for Node.js.

## Overview

**sdcvalidator** is a TypeScript/Node.js implementation of SDC4 validation that implements the unique "quarantine-and-tag" pattern for data quality management. Unlike traditional XML Schema validators that reject invalid data, sdcvalidator preserves invalid data while injecting ISO 21090-based ExceptionalValue elements to flag quality issues.

### Key Features

- ✅ **SDC4 Validation** - Full XML Schema 1.1 validation against SDC4 schemas
- ✅ **ExceptionalValue Recovery** - Automatic injection of 15 ISO 21090 ExceptionalValue types
- ✅ **Pattern-Based Error Classification** - Intelligent mapping of validation errors to appropriate types
- ✅ **Data Preservation** - "Quarantine-and-tag" pattern keeps all submitted data
- ✅ **TypeScript-First** - Full type definitions for excellent IDE support
- ✅ **CLI Tool** - Command-line interface for validation workflows
- ✅ **Production-Ready** - Comprehensive testing and documentation

## Installation

```bash
npm install sdcvalidator
```

Or install globally for CLI usage:

```bash
npm install -g sdcvalidator
```

### Requirements

- Node.js 18.x or higher
- npm 9.x or higher

## Quick Start

```typescript
import { SDC4Validator } from 'sdcvalidator';

// Create validator with schema
const validator = new SDC4Validator({
  schema: './path/to/schema.xsd'
});

// Validate and recover
const recovered = await validator.validateWithRecovery('./data.xml');

// Save recovered XML
await validator.saveRecoveredXML('./recovered.xml', recovered);

// Generate validation report
const report = await validator.validateAndReport('./data.xml');
console.log(`Errors: ${report.errorCount}`);
console.log(`Invalid values: ${report.exceptionalValueTypeCounts.INV}`);
```

## CLI Usage

```bash
# Validate XML file
sdcvalidate data.xml --schema schema.xsd

# Validate with recovery
sdcvalidate data.xml -s schema.xsd --recover -o recovered.xml

# Generate JSON report
sdcvalidate data.xml -s schema.xsd --report > report.json

# Check validity (exit code 0 = valid, 1 = invalid)
sdcvalidate data.xml -s schema.xsd --check
```

## ExceptionalValue Types

The validator maps validation errors to 15 ISO 21090 ExceptionalValue types:

| Code | Name | Description |
|------|------|-------------|
| **INV** | Invalid | Value does not conform to expected type/format |
| **OTH** | Other | Value valid but doesn't match expected enumeration |
| **NI** | No Information | Required value is missing |
| **NA** | Not Applicable | Content present but not expected |
| **UNC** | Unencoded | Invalid characters or encoding |
| ... | ... | *See documentation for all 15 types* |

## Development Status

✅ **Version 4.0.0 Complete**

This package has been fully implemented following the comprehensive [Product Requirements Document](./PRD.md).

### Implementation Status

- [x] Phase 1: Foundation - **Complete**
- [x] Phase 2: SDC4 Core - **Complete**
- [x] Phase 3: SDC4Validator API - **Complete**
- [x] Phase 4: CLI Implementation - **Complete**
- [x] Phase 5: Testing & Documentation - **Complete**

### Test Coverage

- **182 tests** across 8 test suites
- **90.4% code coverage** (exceeds 90% target)
- Full CI/CD pipeline with GitHub Actions

## Documentation

Complete documentation is available:

- **[Getting Started Guide](./docs/guides/getting-started.md)** - Installation, basic usage, and core concepts
- **[Error Mapping Guide](./docs/guides/error-mapping.md)** - Customize error classification rules
- **[CLI Usage Guide](./docs/guides/cli-usage.md)** - Command-line tool reference
- **[Advanced Usage Guide](./docs/guides/advanced-usage.md)** - Custom validators, performance, TypeScript
- **[API Reference](./docs/api/)** - Complete API documentation
- **[Examples](./examples/)** - Working code examples

## Related Projects

- [sdcvalidator (Python)](https://github.com/Axius-SDC/sdcvalidator) - Original Python implementation
- [Semantic Data Charter](https://semanticdatacharter.com/) - SDC specification

## License

MIT License - Copyright (c) 2025 Axius SDC, Inc.

See [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please see our contributing guidelines (coming soon).

## Versioning

This package follows the SDC ecosystem semantic versioning convention:
- **Major version** = SDC reference model version (4.x.x for SDC Release 4)
- **Minor version** = New features (4.1.0, 4.2.0, etc.)
- **Patch version** = Bug fixes (4.0.1, 4.0.2, etc.)

---

**Note:** This is the JavaScript/TypeScript port of the Python sdcvalidator package, providing equivalent functionality for Node.js ecosystems.
