/**
 * Unit tests for SDC4 constants
 */

import { describe, it, expect } from 'vitest';
import {
  ExceptionalValueType,
  EXCEPTIONAL_VALUE_METADATA,
  SDC4_NAMESPACE,
  DEFAULT_NAMESPACE_PREFIX,
} from '../../src/sdc4/constants.js';

describe('SDC4 Constants', () => {
  describe('ExceptionalValueType', () => {
    it('should have all 15 types defined', () => {
      const types = Object.values(ExceptionalValueType);
      expect(types).toHaveLength(15);
    });

    it('should have correct type codes', () => {
      expect(ExceptionalValueType.INV).toBe('INV');
      expect(ExceptionalValueType.OTH).toBe('OTH');
      expect(ExceptionalValueType.NI).toBe('NI');
      expect(ExceptionalValueType.NA).toBe('NA');
      expect(ExceptionalValueType.UNC).toBe('UNC');
      expect(ExceptionalValueType.UNK).toBe('UNK');
      expect(ExceptionalValueType.ASKU).toBe('ASKU');
      expect(ExceptionalValueType.ASKR).toBe('ASKR');
      expect(ExceptionalValueType.NASK).toBe('NASK');
      expect(ExceptionalValueType.NAV).toBe('NAV');
      expect(ExceptionalValueType.MSK).toBe('MSK');
      expect(ExceptionalValueType.DER).toBe('DER');
      expect(ExceptionalValueType.PINF).toBe('PINF');
      expect(ExceptionalValueType.NINF).toBe('NINF');
      expect(ExceptionalValueType.TRC).toBe('TRC');
    });
  });

  describe('EXCEPTIONAL_VALUE_METADATA', () => {
    it('should have metadata for all 15 types', () => {
      const metadataKeys = Object.keys(EXCEPTIONAL_VALUE_METADATA);
      expect(metadataKeys).toHaveLength(15);
    });

    it('should have complete metadata for each type', () => {
      for (const type of Object.values(ExceptionalValueType)) {
        const metadata = EXCEPTIONAL_VALUE_METADATA[type];
        expect(metadata).toBeDefined();
        expect(metadata.code).toBeTruthy();
        expect(metadata.name).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(typeof metadata.code).toBe('string');
        expect(typeof metadata.name).toBe('string');
        expect(typeof metadata.description).toBe('string');
      }
    });

    it('should have correct metadata for INV', () => {
      const metadata = EXCEPTIONAL_VALUE_METADATA[ExceptionalValueType.INV];
      expect(metadata.code).toBe('INV');
      expect(metadata.name).toBe('Invalid');
      expect(metadata.description).toContain('conform');
    });

    it('should have correct metadata for OTH', () => {
      const metadata = EXCEPTIONAL_VALUE_METADATA[ExceptionalValueType.OTH];
      expect(metadata.code).toBe('OTH');
      expect(metadata.name).toBe('Other');
      expect(metadata.description).toContain('enumerat');
    });

    it('should have correct metadata for NI', () => {
      const metadata = EXCEPTIONAL_VALUE_METADATA[ExceptionalValueType.NI];
      expect(metadata.code).toBe('NI');
      expect(metadata.name).toBe('No Information');
      expect(metadata.description).toContain('missing');
    });
  });

  describe('SDC4_NAMESPACE', () => {
    it('should be the correct SDC4 namespace URI', () => {
      expect(SDC4_NAMESPACE).toBe('https://semanticdatacharter.com/ns/sdc4/');
    });

    it('should end with trailing slash', () => {
      expect(SDC4_NAMESPACE).toMatch(/\/$/);
    });
  });

  describe('DEFAULT_NAMESPACE_PREFIX', () => {
    it('should be "sdc4"', () => {
      expect(DEFAULT_NAMESPACE_PREFIX).toBe('sdc4');
    });
  });
});
