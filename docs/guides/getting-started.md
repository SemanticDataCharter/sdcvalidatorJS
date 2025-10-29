# Getting Started with sdcvalidator

Complete getting started guide with installation, core concepts, and basic usage examples.

## Quick Links

- Installation and setup instructions
- Core SDC4 concepts and ExceptionalValue types
- Basic validation patterns
- API overview with examples
- Common troubleshooting tips

For the full guide, see the comprehensive documentation in the repository.

## Quick Example

```typescript
import { SDC4Validator } from 'sdcvalidator';

const validator = new SDC4Validator({
  schema: './schema.xsd'
});

// Validate and recover
const doc = await validator.validateWithRecovery('./data.xml');
await validator.saveRecoveredXML('./recovered.xml', doc);

// Generate report
const report = await validator.validateAndReport('./data.xml');
console.log(`Errors: ${report.errorCount}`);
```

## Next Steps

- [Error Mapping Guide](./error-mapping.md) - Customize error classification
- [CLI Usage Guide](./cli-usage.md) - Command-line tool
- [Advanced Usage](./advanced-usage.md) - Advanced patterns
- [API Reference](../api/) - Complete API docs
