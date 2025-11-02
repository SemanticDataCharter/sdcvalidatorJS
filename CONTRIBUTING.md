# Contributing to sdcvalidatorJS

Thank you for your interest in contributing to sdcvalidatorJS! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

**In summary**:
- Be respectful and professional
- Welcome diverse perspectives
- Focus on constructive feedback
- Show empathy towards others

---

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report**:
- Check existing [GitHub Issues](https://github.com/Axius-SDC/sdcvalidatorJS/issues)
- Try the latest version from `main` branch
- Collect relevant information (Node version, OS, minimal reproduction)

**Submitting a bug report**:
1. Use the bug report template
2. Provide clear title and description
3. Include minimal reproduction example
4. Specify your environment (Node version, OS, npm version)
5. Include error messages and stack traces

### Suggesting Enhancements

We welcome enhancement proposals! Please:

1. **Open an issue** describing the enhancement
2. **Explain the use case** - Why is this needed?
3. **Propose a solution** - How should it work?
4. **Consider backward compatibility** - Will this break existing code?

### Contributing Code

**Areas where we welcome contributions**:
- Bug fixes
- New ExceptionalValue mapping rules
- Performance improvements
- Documentation improvements
- Test coverage improvements
- CLI enhancements
- TypeScript type improvements
- Browser compatibility (future)

---

## Development Setup

### Prerequisites

- **Node.js 18.x or higher**
- **npm 9.x or higher**
- **git**

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/sdcvalidatorJS.git
cd sdcvalidatorJS

# 3. Add upstream remote
git remote add upstream https://github.com/Axius-SDC/sdcvalidatorJS.git

# 4. Install dependencies
npm install

# 5. Run tests
npm test

# 6. Build the package
npm run build
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Coding Standards

### TypeScript Style Guide

We follow **TypeScript best practices** with these specifics:

- **Strict mode**: `strict: true` in tsconfig.json
- **No implicit any**: All types must be explicit
- **Interface over type**: Prefer `interface` for object shapes
- **Naming conventions**:
  - Classes: `PascalCase`
  - Interfaces: `PascalCase` (no `I` prefix)
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Private: `_leadingUnderscore` or `#privateField`

```typescript
// ✅ GOOD
export interface ValidationOptions {
  schema: string;
  verbose?: boolean;
}

export class SDC4Validator {
  private readonly schema: XMLSchema;
  #errorMapper: ErrorMapper;

  constructor(options: ValidationOptions) {
    this.schema = loadSchema(options.schema);
    this.#errorMapper = new ErrorMapper();
  }
}

// ❌ BAD
interface IValidationOptions {  // Don't use I prefix
  schema: any;  // Don't use any
  verbose?;  // Missing type
}

class sdc4Validator {  // Wrong casing
  schema;  // Missing type and access modifier
}
```

### Code Formatting

- **Prettier** for consistent formatting
- **Line length**: 100 characters (Prettier default)
- **Semicolons**: Required (Prettier default)
- **Quotes**: Single quotes (configurable in .prettierrc)
- **Trailing commas**: ES5 style

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

### Documentation (TSDoc)

Use **TSDoc** for all public APIs:

```typescript
/**
 * Validates an XML instance and injects ExceptionalValues for errors.
 *
 * @param instancePath - Path to XML instance file or XML string
 * @param options - Optional validation options
 * @returns Recovered document with ExceptionalValue elements
 * @throws {ValidationError} If XML is malformed
 * @throws {SchemaError} If schema cannot be loaded
 *
 * @example
 * ```typescript
 * const validator = new SDC4Validator({ schema: './schema.xsd' });
 * const recovered = await validator.validateWithRecovery('./data.xml');
 * ```
 *
 * @see {@link ValidationOptions} for available options
 * @public
 */
async validateWithRecovery(
  instancePath: string,
  options?: ValidationOptions
): Promise<RecoveredDocument> {
  // Implementation
}
```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch

# Run specific test file
npm test -- error-mapper

# Run with verbose output
npm test -- --reporter=verbose
```

### Writing Tests

**Test structure with Vitest**:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SDC4Validator } from '../../src/sdc4/validator';

describe('SDC4Validator', () => {
  let validator: SDC4Validator;

  beforeEach(() => {
    validator = new SDC4Validator({
      schema: './tests/fixtures/schemas/test.xsd'
    });
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('validateWithRecovery', () => {
    it('should inject INV ExceptionalValue for invalid integer', async () => {
      // Arrange
      const instancePath = './tests/fixtures/instances/invalid-int.xml';

      // Act
      const recovered = await validator.validateWithRecovery(instancePath);

      // Assert
      const invElements = recovered.getElementsByTagName('INV');
      expect(invElements.length).toBe(1);
      expect(invElements[0].textContent).toContain('Invalid');
    });

    it('should preserve invalid data after recovery', async () => {
      const recovered = await validator.validateWithRecovery(
        './tests/fixtures/instances/invalid-int.xml'
      );

      const valueElement = recovered.getElementsByTagName('xdcount-value')[0];
      expect(valueElement.textContent).toBe('not_a_number');
    });
  });
});
```

### Test Coverage Requirements

- **Minimum**: 85% overall coverage
- **SDC4 module**: 90% coverage (critical functionality)
- **New features**: 100% coverage required for new code

### Test Data

- Place test schemas in `tests/fixtures/schemas/`
- Place test instances in `tests/fixtures/instances/`
- Keep test files small and focused
- Name test files descriptively: `invalid-integer.xml`, `missing-required.xml`

---

## Pull Request Process

### Before Submitting

1. **Create a branch** from `main`
   ```bash
   git checkout -b fix/issue-123-invalid-mapping
   # or
   git checkout -b feature/add-new-exceptional-value
   ```

2. **Make your changes**
   - Follow coding standards
   - Add/update tests
   - Update documentation

3. **Run quality checks**
   ```bash
   npm run lint          # ESLint
   npm run typecheck     # TypeScript
   npm test              # Tests
   npm run format:check  # Prettier
   ```

4. **Build successfully**
   ```bash
   npm run build
   ```

### Commit Messages

Use conventional commit format:

```
type(scope): brief description

Longer description if needed

Fixes #123
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(sdc4): add support for new ExceptionalValue type
fix(error-mapper): correct INV classification for pattern errors
docs(readme): add browser compatibility section
test(validator): increase coverage for edge cases
```

### Submitting Pull Request

1. **Push to your fork**
   ```bash
   git push origin fix/issue-123-invalid-mapping
   ```

2. **Open pull request** on GitHub
   - Use PR template
   - Reference related issues: "Closes #123"
   - Provide clear description of changes
   - Include before/after examples if applicable

3. **Wait for review**
   - Address reviewer feedback
   - Keep PR focused (one feature/fix per PR)
   - Be responsive to comments

### PR Review Criteria

Reviewers check for:

- ✅ Tests pass in CI
- ✅ Code follows TypeScript/style guidelines
- ✅ Test coverage maintained/improved
- ✅ Documentation updated
- ✅ No breaking changes (or clearly documented)
- ✅ TypeScript types are correct
- ✅ Commit messages are clear

### After Approval

- Maintainer will merge your PR
- Your contribution will be credited
- Thank you! 🎉

---

## Linting and Formatting

### ESLint

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Check types
npm run typecheck

# VS Code integration
# TypeScript errors show in editor automatically
```

---

## Building and Packaging

### Building for Distribution

```bash
# Build for production
npm run build

# Output structure:
# dist/
#   ├── esm/       # ES Modules
#   ├── cjs/       # CommonJS
#   └── types/     # TypeScript definitions
```

### Testing the Build

```bash
# Build
npm run build

# Test in another project
cd ../test-project
npm install ../sdcvalidatorJS

# Or use npm link
cd sdcvalidatorJS
npm link
cd ../test-project
npm link sdcvalidator
```

---

## Release Process

*(For maintainers)*

### Preparing a Release

1. **Update version**
   ```bash
   npm version patch  # 4.0.0 → 4.0.1
   # or
   npm version minor  # 4.0.0 → 4.1.0
   ```

2. **Update CHANGELOG** (if exists)
   - Add new version section
   - List changes

3. **Run full quality checks** (automatic in prepublishOnly)
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Build package**
   ```bash
   npm run build
   ```

5. **Publish to npm**
   ```bash
   npm publish
   ```

6. **Tag release on GitHub**
   ```bash
   git tag v4.0.1
   git push origin --tags
   ```

7. **Create GitHub release**
   - Use tag `v4.0.1`
   - Copy changelog entries to release notes

---

## Documentation

### Where to Document

- **README.md** - Quick start, API overview, examples
- **docs/guides/** - Comprehensive usage guides
- **docs/api/** - API reference (generated by TypeDoc)
- **CLAUDE.md** - Developer/contributor guidance
- **TSDoc comments** - Inline documentation in code

### Generating API Documentation

```bash
# Generate TypeDoc documentation
npm run docs

# Output: docs/api/
```

### Documentation Style

- Use present tense: "Returns the validated document"
- Include code examples in TSDoc comments
- Cross-reference related types/functions
- Keep examples simple and self-contained

---

## Specific Contribution Areas

### Adding New ExceptionalValue Mapping Rules

1. **Identify error pattern**
   - What validation error should trigger this?
   - Which ExceptionalValue type is appropriate?

2. **Add mapping rule** in `src/sdc4/error-mapper.ts`
   ```typescript
   private mapErrorToType(error: ValidationError): ExceptionalValueType {
     // Add new rule
     if (this.isConfidentialError(error)) {
       return ExceptionalValueType.MSK;
     }

     // Existing rules...
   }

   private isConfidentialError(error: ValidationError): boolean {
     return error.message.toLowerCase().includes('confidential');
   }
   ```

3. **Add tests** in `tests/unit/sdc4/error-mapper.test.ts`
   ```typescript
   it('should map confidential errors to MSK', () => {
     const error: ValidationError = {
       message: 'Confidential field cannot be validated',
       path: '/root/confidential'
     };

     const type = mapper.mapError(error);
     expect(type).toBe(ExceptionalValueType.MSK);
   });
   ```

4. **Update documentation**
   - Add to README ExceptionalValue table
   - Document in error-mapping guide

### Performance Optimization

1. **Profile first**
   ```typescript
   console.time('validation');
   await validator.validateWithRecovery(instancePath);
   console.timeEnd('validation');
   ```

2. **Optimize**
   - Cache schemas
   - Reuse validator instances
   - Optimize XPath queries
   - Reduce DOM manipulations

3. **Benchmark**
   - Compare before/after
   - Document improvement

4. **Add performance test**
   ```typescript
   it('should validate large file within 5 seconds', async () => {
     const start = Date.now();
     await validator.validateWithRecovery('./large-file.xml');
     const elapsed = Date.now() - start;

     expect(elapsed).toBeLessThan(5000);
   });
   ```

### Bug Fixes

1. **Write failing test** first
   ```typescript
   it('should handle XPath with special characters', async () => {
     // This currently fails with XPathError
     const result = await validator.validate('./special-chars.xml');
     expect(result.valid).toBe(true);
   });
   ```

2. **Fix the bug**

3. **Verify** test now passes

4. **Submit PR** with test + fix

---

## TypeScript Tips

### Using Type Guards

```typescript
function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'path' in error
  );
}

// Usage
if (isValidationError(error)) {
  console.log(error.message);  // TypeScript knows the type
}
```

### Generic Types

```typescript
interface ValidationResult<T = Document> {
  valid: boolean;
  document: T;
  errors: ValidationError[];
}

// Usage
const result: ValidationResult<RecoveredDocument> = await validator.validate(xml);
```

---

## Communication

### GitHub Issues

Use for:
- Bug reports
- Feature requests
- Questions about implementation

### GitHub Discussions

Use for:
- General questions
- Design discussions
- Best practices
- Sharing use cases

### Email

For private matters: contact@axius-sdc.com

---

## Recognition

Contributors are recognized in:
- **GitHub** - Contribution graph, commit history
- **npm package** - Listed as contributor
- Future **CHANGELOG** or **CONTRIBUTORS** file

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**, the same license as this project.

**Copyright** (c) 2025 Axius-SDC, Inc.

---

## Getting Help

- **GitHub Issues** - https://github.com/Axius-SDC/sdcvalidatorJS/issues
- **GitHub Discussions** - https://github.com/Axius-SDC/sdcvalidatorJS/discussions
- **Email** - contact@axius-sdc.com
- **CLAUDE.md** - Developer guidance (this repo)
- **Python version** - https://github.com/Axius-SDC/sdcvalidator (reference)

---

## Quick Reference

```bash
# Development workflow
git checkout -b feature/my-feature
npm install
npm test
npm run lint
npm run typecheck
npm run build

# Make changes, add tests
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Create PR on GitHub
```

**Thank you for contributing to sdcvalidatorJS!** Together we make SDC4 data quality tracking better for JavaScript/TypeScript developers. 🚀
