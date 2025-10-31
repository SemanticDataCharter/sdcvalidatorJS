/**
 * ErrorMapper - Maps validation errors to ExceptionalValue types
 *
 * @module sdc4/error-mapper
 */

/* eslint-disable no-unused-vars */

import { ExceptionalValueType, EXCEPTIONAL_VALUE_METADATA } from './constants.js';
import type { ValidationError, ErrorSummary } from '../types/validator.js';

/**
 * Rule for mapping errors to ExceptionalValue types.
 */
export interface MappingRule {
  condition: (error: ValidationError) => boolean;
  evType: ExceptionalValueType;
  priority: number;
}

/**
 * Maps XML Schema validation errors to ExceptionalValue types
 * using pattern-based rules.
 */
export class ErrorMapper {
  private rules: MappingRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default error mapping rules based on SDC4 specification.
   * Rules are evaluated in priority order (lower number = higher priority).
   */
  private initializeDefaultRules(): void {
    // Rule 1: Missing Required Elements/Attributes → NI (No Information)
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          msg.includes('missing required') ||
          (msg.includes('required') && msg.includes('missing')) ||
          (msg.includes('element') && msg.includes('required')) ||
          (msg.includes('content') && msg.includes('not complete')) ||
          /minimum .* is \d+/.test(msg)
        );
      },
      ExceptionalValueType.NI,
      10
    );

    // Rule 2: Type Violations → INV (Invalid)
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          msg.includes('not a valid value') ||
          msg.includes('invalid value') ||
          msg.includes('is not valid for type') ||
          (msg.includes('type') && msg.includes('does not match')) ||
          msg.includes('cannot be converted') ||
          msg.includes('expected type') ||
          msg.includes('wrong type') ||
          (msg.includes('invalid') && msg.includes('format')) ||
          msg.includes('malformed') ||
          (error.type?.toLowerCase().includes('decode') ?? false)
        );
      },
      ExceptionalValueType.INV,
      20
    );

    // Rule 3: Constraint/Facet Violations → INV
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          (msg.includes('pattern') && msg.includes('not matched')) ||
          msg.includes('does not match pattern') ||
          msg.includes('length constraint') ||
          /minlength|maxlength/.test(msg) ||
          /mininclusive|maxinclusive/.test(msg) ||
          /minexclusive|maxexclusive/.test(msg) ||
          /totaldigits|fractiondigits/.test(msg) ||
          (msg.includes('assertion') && msg.includes('failed')) ||
          (msg.includes('constraint') && msg.includes('violated')) ||
          (msg.includes('exceeds') && msg.includes('maximum')) ||
          (msg.includes('below') && msg.includes('minimum'))
        );
      },
      ExceptionalValueType.INV,
      30
    );

    // Rule 4: Enumeration Violations → OTH (Other)
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          msg.includes('not in enumeration') ||
          (msg.includes('not') && msg.includes('allowed value')) ||
          (msg.includes('not') && msg.includes('permitted value')) ||
          msg.includes('invalid enumeration') ||
          (msg.includes('value') && msg.includes('not') && msg.includes('allowed'))
        );
      },
      ExceptionalValueType.OTH,
      40
    );

    // Rule 5: Unexpected Content → NA (Not Applicable)
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          msg.includes('unexpected') ||
          (msg.includes('not allowed') && !msg.includes('value')) ||
          (msg.includes('not permitted') && !msg.includes('value')) ||
          msg.includes('extra element') ||
          msg.includes('unknown element') ||
          (msg.includes('element') && msg.includes('not expected'))
        );
      },
      ExceptionalValueType.NA,
      50
    );

    // Rule 6: Encoding Errors → UNC (Unencoded)
    this.addRule(
      (error) => {
        const msg = error.message.toLowerCase();
        return (
          msg.includes('encoding error') ||
          msg.includes('decode error') ||
          (msg.includes('character') && msg.includes('not') && msg.includes('allowed')) ||
          msg.includes('invalid character') ||
          msg.includes('whitespace')
        );
      },
      ExceptionalValueType.UNC,
      60
    );

    // Rule 7: Default Fallback → NI
    this.addRule(
      () => true,
      ExceptionalValueType.NI,
      1000 // Lowest priority
    );
  }

  /**
   * Add a custom error mapping rule.
   *
   * @param condition - Function that returns true if rule applies
   * @param evType - ExceptionalValue type to assign
   * @param priority - Rule priority (lower = higher priority, default: 100)
   */
  addRule(
    condition: (error: ValidationError) => boolean,
    evType: ExceptionalValueType,
    priority: number = 100
  ): void {
    this.rules.push({ condition, evType, priority });
    // Sort rules by priority
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Map a validation error to an ExceptionalValue type.
   *
   * @param error - Validation error from schema validator
   * @returns Mapped ExceptionalValue type
   */
  mapError(error: ValidationError): ExceptionalValueType {
    for (const rule of this.rules) {
      try {
        if (rule.condition(error)) {
          return rule.evType;
        }
      } catch (err) {
        console.warn('Error evaluating mapping rule:', err);
        continue;
      }
    }

    // Fallback to NI if no rules matched (should not happen with default rules)
    return ExceptionalValueType.NI;
  }

  /**
   * Get error summary with metadata.
   *
   * @param error - Validation error
   * @param evType - Mapped ExceptionalValue type (optional, will be computed if not provided)
   * @returns Error summary object
   */
  getErrorSummary(
    error: ValidationError,
    evType?: ExceptionalValueType
  ): ErrorSummary {
    const mappedType = evType || this.mapError(error);
    const metadata = EXCEPTIONAL_VALUE_METADATA[mappedType];

    return {
      xpath: error.path || '/',
      errorType: error.type || 'validation-error',
      reason: error.message,
      exceptionalValueType: metadata.code,
      exceptionalValueName: metadata.name,
      description: metadata.description,
    };
  }

  /**
   * Get count of all registered rules.
   *
   * @returns Number of rules
   */
  getRuleCount(): number {
    return this.rules.length;
  }

  /**
   * Clear all rules (useful for testing).
   */
  clearRules(): void {
    this.rules = [];
  }
}
