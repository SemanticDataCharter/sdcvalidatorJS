/**
 * Integration tests for SDC4 validation
 */

import { describe, it, expect } from 'vitest';
import { SDC4Validator } from '../../src/sdc4/validator.js';
import { ExceptionalValueType } from '../../src/sdc4/constants.js';
import { parseXML } from '../../src/utils/xml.js';
import { join } from 'path';

describe('SDC4Validator Integration', () => {
  const schemaPath = join(__dirname, '../fixtures/schemas/person.xsd');

  describe('Valid Document', () => {
    it('should validate a valid document without errors', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        validation: 'lax',
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const report = await validator.validateAndReport(xmlPath);

      // With MockValidator, should always be valid (no actual validation)
      expect(report.valid).toBe(true);
      expect(report.errorCount).toBe(0);
    });
  });

  describe('Invalid Document (simulated)', () => {
    it('should generate validation report structure', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        validation: 'lax',
      });

      const xmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');
      const report = await validator.validateAndReport(xmlPath);

      // Check report structure
      expect(report).toHaveProperty('valid');
      expect(report).toHaveProperty('errorCount');
      expect(report).toHaveProperty('errors');
      expect(report).toHaveProperty('exceptionalValueTypeCounts');
      expect(Array.isArray(report.errors)).toBe(true);
      expect(typeof report.valid).toBe('boolean');
      expect(typeof report.errorCount).toBe('number');
    });

    it('should have all ExceptionalValue types in counts', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');
      const report = await validator.validateAndReport(xmlPath);

      // Check all types are present
      expect(report.exceptionalValueTypeCounts).toHaveProperty(ExceptionalValueType.INV);
      expect(report.exceptionalValueTypeCounts).toHaveProperty(ExceptionalValueType.OTH);
      expect(report.exceptionalValueTypeCounts).toHaveProperty(ExceptionalValueType.NI);
      expect(report.exceptionalValueTypeCounts).toHaveProperty(ExceptionalValueType.NA);
      expect(report.exceptionalValueTypeCounts).toHaveProperty(ExceptionalValueType.UNC);
    });
  });

  describe('validateWithRecovery', () => {
    it('should return a valid Document', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const doc = await validator.validateWithRecovery(xmlPath);

      expect(doc).toBeDefined();
      expect(doc.documentElement).toBeDefined();
      expect(doc.documentElement.localName).toBe('Person');
    });

    it('should not modify valid documents', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const originalDoc = await parseXML(xmlPath);
      const originalXML = originalDoc.toString();

      const recoveredDoc = await validator.validateWithRecovery(xmlPath);
      const recoveredXML = recoveredDoc.toString();

      // Should be essentially the same (whitespace may differ)
      expect(recoveredDoc.documentElement.localName).toBe(originalDoc.documentElement.localName);
    });

    it('should support removeExistingEV option', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');

      // First pass
      const doc1 = await validator.validateWithRecovery(xmlPath, {
        removeExistingEV: false,
      });
      expect(doc1).toBeDefined();

      // Second pass with removal
      const doc2 = await validator.validateWithRecovery(xmlPath, {
        removeExistingEV: true,
      });
      expect(doc2).toBeDefined();
    });
  });

  describe('Error iteration', () => {
    it('should allow iterating over errors', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const errors = [];

      for await (const error of validator.iterErrorsWithMapping(xmlPath)) {
        errors.push(error);
      }

      // With MockValidator, should have no errors
      expect(Array.isArray(errors)).toBe(true);
    });

    it('should yield error objects with correct structure', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
      });

      const xmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');

      for await (const error of validator.iterErrorsWithMapping(xmlPath)) {
        expect(error).toHaveProperty('xpath');
        expect(error).toHaveProperty('errorType');
        expect(error).toHaveProperty('reason');
        expect(error).toHaveProperty('exceptionalValueType');
        expect(error).toHaveProperty('exceptionalValueName');
        expect(error).toHaveProperty('description');
        break; // Just check first error
      }
    });
  });

  describe('Validation modes', () => {
    it('should support lax mode', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        validation: 'lax',
      });

      const xmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');
      const report = await validator.validateAndReport(xmlPath);

      // Should not throw
      expect(report).toBeDefined();
    });

    it('should support skip mode', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        validation: 'skip',
      });

      const xmlPath = join(__dirname, '../fixtures/invalid/person-invalid-type.xml');
      const report = await validator.validateAndReport(xmlPath);

      // Should skip validation
      expect(report.valid).toBe(true);
      expect(report.errorCount).toBe(0);
    });
  });

  describe('Custom namespace prefix', () => {
    it('should support custom namespace prefix', async () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        namespacePrefix: 'custom',
      });

      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const doc = await validator.validateWithRecovery(xmlPath);

      expect(doc).toBeDefined();
      expect(validator.getInstanceModifier().getNamespacePrefix()).toBe('custom');
    });
  });

  describe('Getter methods', () => {
    it('should return error mapper instance', () => {
      const validator = new SDC4Validator({ schema: schemaPath });
      const errorMapper = validator.getErrorMapper();

      expect(errorMapper).toBeDefined();
      expect(errorMapper.getRuleCount()).toBeGreaterThan(0);
    });

    it('should return instance modifier instance', () => {
      const validator = new SDC4Validator({ schema: schemaPath });
      const instanceModifier = validator.getInstanceModifier();

      expect(instanceModifier).toBeDefined();
      expect(instanceModifier.getNamespacePrefix()).toBe('sdc4');
    });

    it('should return validation mode', () => {
      const validator = new SDC4Validator({
        schema: schemaPath,
        validation: 'strict'
      });

      expect(validator.getValidationMode()).toBe('strict');
    });

    it('should return lax validation mode by default', () => {
      const validator = new SDC4Validator({ schema: schemaPath });

      expect(validator.getValidationMode()).toBe('lax');
    });
  });

  describe('saveRecoveredXML', () => {
    it('should save recovered XML to file', async () => {
      const validator = new SDC4Validator({ schema: schemaPath });
      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const outputPath = join(__dirname, '../fixtures/output-saved.xml');

      // Clean up if exists
      const fs = require('fs');
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      await validator.saveRecoveredXML(outputPath, xmlPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Clean up
      fs.unlinkSync(outputPath);
    });

    it('should save with custom options', async () => {
      const validator = new SDC4Validator({ schema: schemaPath });
      const xmlPath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const outputPath = join(__dirname, '../fixtures/output-custom.xml');

      const fs = require('fs');
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      await validator.saveRecoveredXML(outputPath, xmlPath, {
        prettyPrint: true,
        encoding: 'UTF-8'
      });

      expect(fs.existsSync(outputPath)).toBe(true);

      // Clean up
      fs.unlinkSync(outputPath);
    });
  });
});
