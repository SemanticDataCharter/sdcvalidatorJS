# Security Policy

## Supported Versions

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 4.0.x   | :white_check_mark: | Current release |
| < 4.0   | :x:                | Pre-release versions |

---

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

### Private Reporting

**Email**: `security@axius-sdc.com`
- Subject: `[SECURITY] sdcvalidatorJS: Brief description`
- Include: Detailed description, reproduction steps, impact assessment

**GitHub Security Advisory**: Use GitHub's private vulnerability reporting
- Go to repository → Security tab → Report a vulnerability

### What to Include

- **Description** - What is the vulnerability?
- **Impact** - What could an attacker do?
- **Reproduction** - Step-by-step instructions
- **Affected versions** - Which versions are vulnerable?
- **Environment** - Node version, OS
- **Suggested fix** - If you have ideas (optional)

### Response Timeline

1. **Acknowledgment** - Within 48 hours
2. **Initial assessment** - Within 1 week
3. **Fix development** - 30 days target for critical issues
4. **Public disclosure** - 90 days default (coordinated with reporter)

---

## Security Best Practices

### For XML Validation

```typescript
// ✅ SAFE: Disable external entity resolution
import { SDC4Validator } from 'sdcvalidator';

const validator = new SDC4Validator({
  schema: './schema.xsd',
  xmlParserOptions: {
    // Disable dangerous features
    resolveExternalEntities: false,
    processInternalEntities: false
  }
});
```

### Avoid These Patterns

```typescript
// ❌ UNSAFE: User-controlled schema loading
const userSchemaUrl = request.query.schema;
const validator = new SDC4Validator({ schema: userSchemaUrl });

// ✅ SAFE: Whitelist schemas
const ALLOWED_SCHEMAS = {
  'patient': './schemas/patient.xsd',
  'product': './schemas/product.xsd'
};
const schema = ALLOWED_SCHEMAS[userChoice];
if (schema) {
  const validator = new SDC4Validator({ schema });
}
```

```typescript
// ❌ UNSAFE: Path traversal in output
const outputPath = userInput;
await validator.saveRecoveredXML(outputPath, recovered);

// ✅ SAFE: Validate paths
import { resolve, normalize } from 'path';

function safeOutputPath(userInput: string, baseDir: string): string {
  const normalized = normalize(userInput);
  const fullPath = resolve(baseDir, normalized);

  if (!fullPath.startsWith(baseDir)) {
    throw new Error('Invalid output path');
  }
  return fullPath;
}

const safePath = safeOutputPath(userInput, '/allowed/output/');
await validator.saveRecoveredXML(safePath, recovered);
```

### Resource Limits

```typescript
// Set timeouts for validation
const AbortController = require('abort-controller');

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);  // 30s

try {
  const result = await validator.validateWithRecovery(file, {
    signal: controller.signal
  });
} finally {
  clearTimeout(timeout);
}
```

---

## Known Security Considerations

### XML External Entity (XXE) Protection

**Status**: ✅ Protected by default (via @xmldom/xmldom)

- External entities disabled by default
- DTD processing restricted
- Network access disabled

### Prototype Pollution

**Status**: ✅ Mitigated

- No use of unsafe object merge operations
- All object creation uses `Object.create(null)` for maps
- Dependencies audited regularly

### Dependency Vulnerabilities

**Status**: ✅ Monitored

- `npm audit` run in CI/CD
- Dependabot enabled for automated updates
- Monthly security reviews

### ReDoS (Regular Expression DoS)

**Status**: ✅ Tested

- All regex patterns tested for complexity
- No exponential backtracking patterns
- Input validation limits applied

---

## Secure Coding Practices

### Input Validation

```typescript
// Always validate inputs
function validateXMLPath(path: string): void {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string');
  }

  if (path.includes('..')) {
    throw new Error('Path traversal attempt detected');
  }

  if (!path.endsWith('.xml')) {
    throw new Error('Invalid file extension');
  }
}
```

### Safe XML Parsing

```typescript
// Use safe defaults
import { DOMParser } from '@xmldom/xmldom';

const parser = new DOMParser({
  errorHandler: {
    warning: (msg) => console.warn(msg),
    error: (msg) => { throw new Error(msg); },
    fatalError: (msg) => { throw new Error(msg); }
  }
});

// Don't parse untrusted DTDs
const doc = parser.parseFromString(xmlString, 'text/xml');
```

---

## Dependency Security

### Core Dependencies

- **@xmldom/xmldom** (0.8.10+) - Actively maintained, security-focused
- **xpath** (0.0.34+) - Minimal, stable
- **commander** (12.0.0+) - Widely used, secure

### Security Auditing

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Generate audit report
npm audit --json > audit-report.json
```

---

## CI/CD Security

### GitHub Actions

- **Dependency scanning** - npm audit on every PR
- **SAST** - CodeQL security analysis
- **Secrets scanning** - Automated secret detection
- **Least privilege** - Minimal workflow permissions

---

## Vulnerability Disclosure Policy

### Our Commitments

1. **Acknowledge** reports within 48 hours
2. **Communicate** regularly during investigation
3. **Credit** security researchers (if desired)
4. **Coordinate** public disclosure timing

### Disclosure Timeline

- **Critical**: 1-7 days
- **High**: 7-14 days
- **Medium**: 14-30 days
- **Low**: Next regular release

---

## Security Hall of Fame

*None yet - be the first responsible security researcher!*

---

## Contact

**Security issues**: `security@axius-sdc.com`

**Other issues**: https://github.com/Axius-SDC/sdcvalidatorJS/issues

---

## Additional Resources

- [OWASP XML Security](https://cheatsheetseries.owasp.org/cheatsheets/XML_Security_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security](https://docs.npmjs.com/cli/v10/using-npm/security)

---

**Security is a shared responsibility. Thank you for helping keep sdcvalidatorJS secure!**
