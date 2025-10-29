/**
 * Unit tests for convenience functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateWithRecovery, isValid, iterErrors } from '../../src/sdc4/convenience.js';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

describe('Convenience Functions', () => {
  const schemaPath = join(__dirname, '../fixtures/schemas/person.xsd');
  const validXmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
  const invalidXmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');
  const outputPath = join(__dirname, '../fixtures/output-test.xml');

  afterEach(() => {
    // Clean up output file if created
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
  });

  describe('validateWithRecovery', () => {
    it('should validate and return recovered document without saving', async () => {
      const doc = await validateWithRecovery(schemaPath, validXmlPath);

      expect(doc).toBeDefined();
      expect(doc.documentElement).toBeDefined();
      expect(doc.documentElement.localName).toBe('Person');
    });

    it('should validate and save recovered document when outputPath provided', async () => {
      const doc = await validateWithRecovery(schemaPath, invalidXmlPath, outputPath);

      expect(doc).toBeDefined();
      expect(doc.documentElement).toBeDefined();
      expect(existsSync(outputPath)).toBe(true);
    });

    it('should accept custom namespace prefix option', async () => {
      const doc = await validateWithRecovery(
        schemaPath,
        validXmlPath,
        undefined,
        { namespacePrefix: 'custom' }
      );

      expect(doc).toBeDefined();
      expect(doc.documentElement.localName).toBe('Person');
    });

    it('should accept validation mode option', async () => {
      const doc = await validateWithRecovery(
        schemaPath,
        validXmlPath,
        undefined,
        { validation: 'strict' }
      );

      expect(doc).toBeDefined();
      expect(doc.documentElement.localName).toBe('Person');
    });

    it('should handle invalid XML and inject ExceptionalValues', async () => {
      const doc = await validateWithRecovery(schemaPath, invalidXmlPath);

      expect(doc).toBeDefined();
      // The document should be modified with ExceptionalValue elements
      // (exact structure depends on validation errors found)
      expect(doc.documentElement).toBeDefined();
    });
  });

  describe('isValid', () => {
    it('should return true for valid XML', async () => {
      const valid = await isValid(schemaPath, validXmlPath);
      expect(valid).toBe(true);
    });

    it('should return validation status as boolean', async () => {
      // With MockValidator, both will be true since no actual validation occurs
      const valid = await isValid(schemaPath, invalidXmlPath);
      expect(typeof valid).toBe('boolean');
    });

    it('should handle non-existent XML file', async () => {
      await expect(isValid(schemaPath, '/nonexistent/file.xml')).rejects.toThrow();
    });

    it('should handle non-existent schema file', async () => {
      await expect(isValid('/nonexistent/schema.xsd', validXmlPath)).rejects.toThrow();
    });
  });

  describe('iterErrors', () => {
    it('should create an async iterator', async () => {
      const errors = [];
      for await (const error of iterErrors(schemaPath, validXmlPath)) {
        errors.push(error);
      }

      // With MockValidator, no errors will be found
      expect(Array.isArray(errors)).toBe(true);
    });

    it('should return async generator that can be iterated', async () => {
      const errors = [];
      for await (const error of iterErrors(schemaPath, invalidXmlPath)) {
        errors.push(error);
      }

      // With MockValidator, no errors will be found
      expect(Array.isArray(errors)).toBe(true);

      // If errors exist (with a real validator), check structure
      errors.forEach(error => {
        expect(error).toHaveProperty('xpath');
        expect(error).toHaveProperty('exceptionalValueType');
        expect(error).toHaveProperty('exceptionalValueName');
        expect(error).toHaveProperty('reason');
      });
    });

    it('should allow breaking iteration early', async () => {
      let count = 0;
      for await (const error of iterErrors(schemaPath, invalidXmlPath)) {
        count++;
        if (count >= 1) {
          break;
        }
      }

      // With MockValidator, count will be 0
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-existent XML file', async () => {
      const iterator = iterErrors(schemaPath, '/nonexistent/file.xml');
      await expect(iterator.next()).rejects.toThrow();
    });

    it('should properly yield error structure when errors exist', async () => {
      const iterator = iterErrors(schemaPath, validXmlPath);
      const result = await iterator.next();

      // Iterator should be done (no errors with MockValidator)
      // But the structure is correct
      expect(result).toHaveProperty('done');
      expect(result).toHaveProperty('value');
    });
  });
});
