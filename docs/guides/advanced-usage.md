# Advanced Usage Guide

Advanced patterns and techniques for sdcvalidator.

## Custom Validators

The default `MockValidator` doesn't perform actual XSD validation. For production use, implement a custom validator:

```typescript
import { XSDValidator, ValidationError, SchemaSource } from 'sdcvalidator';

class CustomValidator implements XSDValidator {
  async validate(
    xmlDoc: Document,
    schema: SchemaSource
  ): Promise<ValidationError[]> {
    // Implement XSD validation logic
    // Return array of validation errors
    return [];
  }
}

const validator = new SDC4Validator({
  schema: './schema.xsd',
  validator: new CustomValidator()
});
```

## Namespace Management

```typescript
import { ensureSDC4Namespace, removeExceptionalValues } from 'sdcvalidator';

// Custom namespace prefix
const validator = new SDC4Validator({
  schema: './schema.xsd',
  namespacePrefix: 'custom'
});

// Remove ExceptionalValue elements
const doc = await parseXML('./recovered.xml');
removeExceptionalValues(doc);
```

## XPath Queries

```typescript
import { selectNodes, selectSingleNode, selectValue, getElementPath } from 'sdcvalidator';

const doc = await parseXML('./data.xml');

// Select nodes
const persons = selectNodes('//person', doc);

// Select single node
const person = selectSingleNode('//person[@id="123"]', doc);

// Get value
const name = selectValue('//person[1]/name', doc);

// Get element path
const path = getElementPath(person);
```

## Performance Optimization

- Reuse validator instances
- Use strict mode for quick checks
- Implement schema caching
- Control concurrency for batch processing

## TypeScript Integration

Full TypeScript support with strong typing for all APIs.

## Resources

- [Getting Started](./getting-started.md)
- [Error Mapping](./error-mapping.md)
- [CLI Usage](./cli-usage.md)
- [API Reference](../api/)
