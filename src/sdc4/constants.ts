/**
 * SDC4 constants including ExceptionalValue types
 *
 * @module sdc4/constants
 */

/**
 * ISO 21090-based ExceptionalValue types for SDC4 validation.
 *
 * These types classify validation errors into standardized categories
 * for data quality management and reporting.
 */
export enum ExceptionalValueType {
  /** Invalid: Value does not conform to expected type/format */
  INV = 'INV',

  /** Other: Value is valid but doesn't match expected enumeration */
  OTH = 'OTH',

  /** No Information: Required value is missing */
  NI = 'NI',

  /** Not Applicable: Content present but not expected in this context */
  NA = 'NA',

  /** Unencoded: Value contains invalid characters or encoding */
  UNC = 'UNC',

  /** Unknown: Value explicitly marked as unknown */
  UNK = 'UNK',

  /** Asked but Unknown: Data was requested but respondent didn't know */
  ASKU = 'ASKU',

  /** Asked and Refused: Data was requested but respondent refused */
  ASKR = 'ASKR',

  /** Not Asked: Data was not requested */
  NASK = 'NASK',

  /** Not Available: Data not currently available */
  NAV = 'NAV',

  /** Masked: Data hidden for privacy/security */
  MSK = 'MSK',

  /** Derived: Value calculated from other values */
  DER = 'DER',

  /** Positive Infinity: Numeric value exceeds maximum */
  PINF = 'PINF',

  /** Negative Infinity: Numeric value below minimum */
  NINF = 'NINF',

  /** Trace: Value present in trace amounts */
  TRC = 'TRC',
}

/**
 * Metadata for each ExceptionalValue type.
 */
export interface ExceptionalValueMetadata {
  code: string;
  name: string;
  description: string;
}

/**
 * Complete metadata for all 15 ExceptionalValue types.
 */
export const EXCEPTIONAL_VALUE_METADATA: Record<
  ExceptionalValueType,
  ExceptionalValueMetadata
> = {
  [ExceptionalValueType.INV]: {
    code: 'INV',
    name: 'Invalid',
    description:
      'The value does not conform to the expected type, format, or constraints defined in the schema.',
  },
  [ExceptionalValueType.OTH]: {
    code: 'OTH',
    name: 'Other',
    description:
      'The value is valid but does not match any of the expected enumerated values.',
  },
  [ExceptionalValueType.NI]: {
    code: 'NI',
    name: 'No Information',
    description: 'A required value is missing or no information is available.',
  },
  [ExceptionalValueType.NA]: {
    code: 'NA',
    name: 'Not Applicable',
    description: 'Content is present but is not expected or applicable in this context.',
  },
  [ExceptionalValueType.UNC]: {
    code: 'UNC',
    name: 'Unencoded',
    description: 'The value contains invalid characters or encoding errors.',
  },
  [ExceptionalValueType.UNK]: {
    code: 'UNK',
    name: 'Unknown',
    description: 'The value is explicitly marked as unknown.',
  },
  [ExceptionalValueType.ASKU]: {
    code: 'ASKU',
    name: 'Asked but Unknown',
    description: 'The information was requested but the respondent did not know the answer.',
  },
  [ExceptionalValueType.ASKR]: {
    code: 'ASKR',
    name: 'Asked and Refused',
    description: 'The information was requested but the respondent refused to provide it.',
  },
  [ExceptionalValueType.NASK]: {
    code: 'NASK',
    name: 'Not Asked',
    description: 'The information was not requested or collected.',
  },
  [ExceptionalValueType.NAV]: {
    code: 'NAV',
    name: 'Not Available',
    description: 'The information is not currently available but may become available later.',
  },
  [ExceptionalValueType.MSK]: {
    code: 'MSK',
    name: 'Masked',
    description: 'The data has been hidden or masked for privacy or security reasons.',
  },
  [ExceptionalValueType.DER]: {
    code: 'DER',
    name: 'Derived',
    description: 'The value has been calculated or derived from other values.',
  },
  [ExceptionalValueType.PINF]: {
    code: 'PINF',
    name: 'Positive Infinity',
    description: 'The numeric value exceeds the maximum representable value.',
  },
  [ExceptionalValueType.NINF]: {
    code: 'NINF',
    name: 'Negative Infinity',
    description: 'The numeric value is below the minimum representable value.',
  },
  [ExceptionalValueType.TRC]: {
    code: 'TRC',
    name: 'Trace',
    description: 'The value is present in trace amounts (too small to measure accurately).',
  },
};

/**
 * Default SDC4 namespace URI
 */
export const SDC4_NAMESPACE = 'https://semanticdatacharter.com/ns/sdc4/';

/**
 * Default namespace prefix for ExceptionalValue elements
 */
export const DEFAULT_NAMESPACE_PREFIX = 'sdc4';
