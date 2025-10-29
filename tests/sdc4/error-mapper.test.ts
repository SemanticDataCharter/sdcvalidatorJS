/**
 * Unit tests for ErrorMapper
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorMapper } from '../../src/sdc4/error-mapper.js';
import { ExceptionalValueType } from '../../src/sdc4/constants.js';
import type { ValidationError } from '../../src/types/validator.js';

describe('ErrorMapper', () => {
  let mapper: ErrorMapper;

  beforeEach(() => {
    mapper = new ErrorMapper();
  });

  describe('Default Rules', () => {
    it('should have default rules initialized', () => {
      expect(mapper.getRuleCount()).toBeGreaterThan(0);
    });

    it('should map missing required errors to NI', () => {
      const error: ValidationError = {
        message: 'Element age is missing required',
        path: '/Person',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.NI);
    });

    it('should map type violations to INV', () => {
      const error: ValidationError = {
        message: 'Value "not_a_number" is not a valid value for type xs:int',
        path: '/Person/age',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.INV);
    });

    it('should map invalid format to INV', () => {
      const error: ValidationError = {
        message: 'Invalid format for email address',
        path: '/Person/email',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.INV);
    });

    it('should map pattern mismatch to INV', () => {
      const error: ValidationError = {
        message: 'Value does not match pattern [^@]+@[^@]+\\.[^@]+',
        path: '/Person/email',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.INV);
    });

    it('should map enumeration violations to OTH', () => {
      const error: ValidationError = {
        message: 'Value "unknown" is not in enumeration',
        path: '/Person/status',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.OTH);
    });

    it('should map unexpected elements to NA', () => {
      const error: ValidationError = {
        message: 'Element unexpected is not allowed here',
        path: '/Person/unexpected',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.NA);
    });

    it('should map encoding errors to UNC', () => {
      const error: ValidationError = {
        message: 'Character encoding error detected',
        path: '/Person/name',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.UNC);
    });

    it('should use NI as fallback for unknown errors', () => {
      const error: ValidationError = {
        message: 'Some random validation error',
        path: '/Person',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.NI);
    });
  });

  describe('Custom Rules', () => {
    it('should allow adding custom rules', () => {
      const initialCount = mapper.getRuleCount();

      mapper.addRule(
        (error) => error.message.includes('custom'),
        ExceptionalValueType.MSK,
        50
      );

      expect(mapper.getRuleCount()).toBe(initialCount + 1);
    });

    it('should apply custom rules', () => {
      mapper.addRule(
        (error) => error.message.includes('confidential'),
        ExceptionalValueType.MSK,
        5 // High priority
      );

      const error: ValidationError = {
        message: 'confidential data not allowed',
        path: '/Person/secret',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.MSK);
    });

    it('should respect rule priority', () => {
      // Add low priority rule
      mapper.addRule(
        (error) => error.message.includes('test'),
        ExceptionalValueType.UNK,
        200
      );

      // Add high priority rule
      mapper.addRule(
        (error) => error.message.includes('test'),
        ExceptionalValueType.MSK,
        1
      );

      const error: ValidationError = {
        message: 'test error',
        path: '/test',
      };

      // Should use high priority rule
      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.MSK);
    });
  });

  describe('getErrorSummary', () => {
    it('should generate error summary', () => {
      const error: ValidationError = {
        message: 'Value is not valid for type',
        path: '/Person/age',
        line: 5,
        column: 10,
      };

      const summary = mapper.getErrorSummary(error);

      expect(summary).toHaveProperty('xpath');
      expect(summary).toHaveProperty('errorType');
      expect(summary).toHaveProperty('reason');
      expect(summary).toHaveProperty('exceptionalValueType');
      expect(summary).toHaveProperty('exceptionalValueName');
      expect(summary).toHaveProperty('description');
      expect(summary.xpath).toBe('/Person/age');
      expect(summary.reason).toBe('Value is not valid for type');
    });

    it('should include mapped ExceptionalValue type', () => {
      const error: ValidationError = {
        message: 'not in enumeration',
        path: '/Person/status',
      };

      const summary = mapper.getErrorSummary(error);
      expect(summary.exceptionalValueType).toBe('OTH');
      expect(summary.exceptionalValueName).toBe('Other');
    });

    it('should accept pre-computed ExceptionalValue type', () => {
      const error: ValidationError = {
        message: 'test error',
        path: '/test',
      };

      const summary = mapper.getErrorSummary(error, ExceptionalValueType.DER);
      expect(summary.exceptionalValueType).toBe('DER');
      expect(summary.exceptionalValueName).toBe('Derived');
    });
  });

  describe('Rule Management', () => {
    it('should clear all rules', () => {
      mapper.clearRules();
      expect(mapper.getRuleCount()).toBe(0);
    });

    it('should work after clearing and re-adding rules', () => {
      mapper.clearRules();
      expect(mapper.getRuleCount()).toBe(0);

      mapper.addRule(() => true, ExceptionalValueType.NI, 1);
      expect(mapper.getRuleCount()).toBe(1);

      const error: ValidationError = {
        message: 'any error',
        path: '/test',
      };

      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.NI);
    });
  });

  describe('Error Condition Edge Cases', () => {
    it('should handle errors with no path', () => {
      const error: ValidationError = {
        message: 'error with no path',
      };

      const summary = mapper.getErrorSummary(error);
      expect(summary.xpath).toBe('/');
    });

    it('should handle errors with no type', () => {
      const error: ValidationError = {
        message: 'error with no type',
        path: '/test',
      };

      const summary = mapper.getErrorSummary(error);
      expect(summary.errorType).toBe('validation-error');
    });

    it('should handle empty error messages', () => {
      const error: ValidationError = {
        message: '',
        path: '/test',
      };

      // Should not throw
      const result = mapper.mapError(error);
      expect(result).toBe(ExceptionalValueType.NI); // Fallback
    });
  });
});
