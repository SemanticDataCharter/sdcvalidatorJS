# SDC4 Validator Examples

This directory contains example code demonstrating various features of the sdcvalidator package.

## Examples

### 1. basic-validation.ts
Basic usage of the SDC4Validator:
- Creating a validator
- Generating validation reports
- Validating with recovery
- Saving recovered XML
- Iterating over errors

```bash
npx tsx examples/basic-validation.ts
```

### 2. custom-error-mapping.ts
Customizing error classification:
- Creating custom ErrorMapper rules
- Adding domain-specific mappings
- Using custom rules in validation

```bash
npx tsx examples/custom-error-mapping.ts
```

### 3. convenience-functions.ts
Using simplified convenience functions:
- Quick validation checks with `isValid()`
- Error iteration with `iterErrors()`
- Recovery with `validateWithRecovery()`

```bash
npx tsx examples/convenience-functions.ts
```

## Running Examples

### Prerequisites

```bash
npm install
npm run build
```

### Update Paths

Before running examples, update the file paths in each example:
- `./path/to/schema.xsd` → Your XSD schema file
- `./path/to/data.xml` → Your XML data file
- `./path/to/recovered.xml` → Output path for recovered XML

### Execute

Using tsx (TypeScript executor):
```bash
npx tsx examples/basic-validation.ts
```

Or compile first:
```bash
npm run build
node dist/examples/basic-validation.js
```

## CLI Examples

### Validate XML

```bash
sdcvalidate data.xml --schema schema.xsd
```

### Validate with Recovery

```bash
sdcvalidate data.xml -s schema.xsd --recover -o recovered.xml
```

### Generate JSON Report

```bash
sdcvalidate data.xml -s schema.xsd --report > report.json
```

### Check Validity (Exit Codes)

```bash
sdcvalidate data.xml -s schema.xsd --check
echo $?  # 0 = valid, 1 = invalid
```

### Custom Namespace Prefix

```bash
sdcvalidate data.xml -s schema.xsd -r -o out.xml --prefix myns
```

### Verbose Output

```bash
sdcvalidate data.xml -s schema.xsd --verbose
```

## Documentation

For complete API documentation, see:
- [Getting Started Guide](../docs/guides/getting-started.md)
- [Error Mapping Guide](../docs/guides/error-mapping.md)
- [CLI Usage Guide](../docs/guides/cli-usage.md)
- [API Reference](../docs/api/)

## Support

For issues or questions:
- GitHub Issues: https://github.com/Axius-SDC/sdcvalidatorJS/issues
- Documentation: See docs/ directory
