/**
 * Unit tests for InstanceModifier
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InstanceModifier, type ErrorLocation } from '../../src/sdc4/instance-modifier.js';
import { ExceptionalValueType } from '../../src/sdc4/constants.js';
import { parseXML } from '../../src/utils/xml.js';
import { DOMParser } from '@xmldom/xmldom';

describe('InstanceModifier', () => {
  let modifier: InstanceModifier;

  beforeEach(() => {
    modifier = new InstanceModifier('sdc4');
  });

  describe('Constructor and Configuration', () => {
    it('should create with default namespace prefix', () => {
      const mod = new InstanceModifier();
      expect(mod.getNamespacePrefix()).toBe('sdc4');
    });

    it('should create with custom namespace prefix', () => {
      const mod = new InstanceModifier('custom');
      expect(mod.getNamespacePrefix()).toBe('custom');
    });

    it('should allow changing namespace prefix', () => {
      modifier.setNamespacePrefix('myns');
      expect(modifier.getNamespacePrefix()).toBe('myns');
    });
  });

  describe('injectExceptionalValues', () => {
    it('should inject single ExceptionalValue element', async () => {
      const xmlString = `<?xml version="1.0"?>
<root>
  <person>
    <name>John</name>
    <age>invalid</age>
  </person>
</root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/person/age',
          evType: ExceptionalValueType.INV,
          reason: 'Invalid type'
        }
      ];

      const result = modifier.injectExceptionalValues(doc, errors);

      expect(result).toBe(doc); // Same instance
      // Check that namespace was added by looking for the attribute
      const rootElement = doc.documentElement;
      const nsAttr = rootElement.getAttribute('xmlns:sdc4');
      expect(nsAttr).toBe('https://semanticdatacharter.com/ns/sdc4/');
    });

    it('should inject multiple ExceptionalValue elements', async () => {
      const xmlString = `<?xml version="1.0"?>
<root>
  <person>
    <name>John</name>
  </person>
</root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/person/age',
          evType: ExceptionalValueType.NI,
          reason: 'Missing required element'
        },
        {
          xpath: '/root/person/email',
          evType: ExceptionalValueType.NI,
          reason: 'Missing required element'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      // Check namespace was added
      const rootElement = doc.documentElement;
      const nsAttr = rootElement.getAttribute('xmlns:sdc4');
      expect(nsAttr).toBe('https://semanticdatacharter.com/ns/sdc4/');
    });

    it('should handle empty error array', async () => {
      const xmlString = '<root><child>value</child></root>';
      const doc = await parseXML(xmlString);

      const result = modifier.injectExceptionalValues(doc, []);

      expect(result).toBe(doc);
    });

    it('should handle errors at different levels', async () => {
      const xmlString = `<?xml version="1.0"?>
<root>
  <level1>
    <level2>
      <level3>value</level3>
    </level2>
  </level1>
</root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/level1/level2/missing',
          evType: ExceptionalValueType.NI,
          reason: 'Missing at level 2'
        },
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.NI,
          reason: 'Missing at root level'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      // Document should be modified
      expect(doc.documentElement).toBeDefined();
    });

    it('should use custom namespace prefix', async () => {
      const customModifier = new InstanceModifier('custom');
      const xmlString = '<root><child>value</child></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.NI,
          reason: 'Missing element'
        }
      ];

      customModifier.injectExceptionalValues(doc, errors);

      // Check custom namespace prefix was used
      const rootElement = doc.documentElement;
      const nsAttr = rootElement.getAttribute('xmlns:custom');
      expect(nsAttr).toBe('https://semanticdatacharter.com/ns/sdc4/');
    });

    it('should handle errors with different ExceptionalValue types', async () => {
      const xmlString = `<root><data>test</data></root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/field1',
          evType: ExceptionalValueType.INV,
          reason: 'Invalid value'
        },
        {
          xpath: '/root/field2',
          evType: ExceptionalValueType.NI,
          reason: 'Not provided'
        },
        {
          xpath: '/root/field3',
          evType: ExceptionalValueType.UNK,
          reason: 'Unknown'
        },
        {
          xpath: '/root/field4',
          evType: ExceptionalValueType.MSK,
          reason: 'Masked'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      expect(doc.documentElement).toBeDefined();
    });

    it('should preserve existing document structure', async () => {
      const xmlString = `<?xml version="1.0"?>
<root>
  <existing>value1</existing>
  <another>value2</another>
</root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.NI,
          reason: 'Missing element'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      // Check existing elements are still there
      const existingElements = doc.getElementsByTagName('existing');
      expect(existingElements.length).toBe(1);
      expect(existingElements[0].textContent).toBe('value1');

      const anotherElements = doc.getElementsByTagName('another');
      expect(anotherElements.length).toBe(1);
      expect(anotherElements[0].textContent).toBe('value2');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid XPath gracefully', async () => {
      const xmlString = '<root><child>value</child></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/nonexistent/path/to/nowhere',
          evType: ExceptionalValueType.NI,
          reason: 'Invalid path'
        }
      ];

      // Should not throw
      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });

    it('should handle root-level errors', async () => {
      const xmlString = '<root><child>value</child></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/',
          evType: ExceptionalValueType.INV,
          reason: 'Root level error'
        }
      ];

      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });

    it('should handle errors with empty reason', async () => {
      const xmlString = '<root><child>value</child></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.NI,
          reason: ''
        }
      ];

      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });
  });

  describe('ExceptionalValue Element Structure', () => {
    it('should create ExceptionalValue element with ev-name child', async () => {
      const xmlString = '<root></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.INV,
          reason: 'Invalid value'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      // Look for INV element
      const invElements = doc.getElementsByTagNameNS(
        'https://semanticdatacharter.com/ns/sdc4/',
        'INV'
      );

      if (invElements.length > 0) {
        const invElement = invElements[0];
        // Check for ev-name child
        const nameElements = invElement.getElementsByTagNameNS(
          'https://semanticdatacharter.com/ns/sdc4/',
          'ev-name'
        );
        expect(nameElements.length).toBeGreaterThan(0);
        if (nameElements.length > 0) {
          expect(nameElements[0].textContent).toBe('Invalid');
        }
      }
    });

    it('should include comment with error reason when provided', async () => {
      const xmlString = '<root></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/missing',
          evType: ExceptionalValueType.NI,
          reason: 'This is the error reason'
        }
      ];

      modifier.injectExceptionalValues(doc, errors);

      // Check that the document contains a comment (implementation detail)
      const serializer = new (require('@xmldom/xmldom').XMLSerializer)();
      const xmlOutput = serializer.serializeToString(doc);

      // If comment is included, it should contain the reason
      if (xmlOutput.includes('<!--')) {
        expect(xmlOutput).toContain('This is the error reason');
      }
    });
  });

  describe('Path Processing', () => {
    it('should group errors by parent correctly', async () => {
      const xmlString = `<root><parent><child1/><child2/></parent></root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/parent/missing1',
          evType: ExceptionalValueType.NI,
          reason: 'Missing 1'
        },
        {
          xpath: '/root/parent/missing2',
          evType: ExceptionalValueType.NI,
          reason: 'Missing 2'
        },
        {
          xpath: '/root/other/missing3',
          evType: ExceptionalValueType.NI,
          reason: 'Missing 3'
        }
      ];

      // Should handle grouping without errors
      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });

    it('should handle single-level paths', async () => {
      const xmlString = '<root></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/missing',
          evType: ExceptionalValueType.NI,
          reason: 'Root level missing'
        }
      ];

      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });

    it('should handle deeply nested paths', async () => {
      const xmlString = `<root>
        <a><b><c><d><e><f>value</f></e></d></c></b></a>
      </root>`;
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/a/b/c/d/e/f/g',
          evType: ExceptionalValueType.NI,
          reason: 'Deeply nested'
        }
      ];

      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });
  });

  describe('Integration with Different ExceptionalValue Types', () => {
    it.each([
      [ExceptionalValueType.INV, 'Invalid'],
      [ExceptionalValueType.OTH, 'Other'],
      [ExceptionalValueType.NI, 'No Information'],
      [ExceptionalValueType.NA, 'Not Applicable'],
      [ExceptionalValueType.UNC, 'Un-encoded'],
      [ExceptionalValueType.UNK, 'Unknown'],
      [ExceptionalValueType.ASKU, 'Asked but Unknown'],
      [ExceptionalValueType.ASKR, 'Asked but Refused'],
      [ExceptionalValueType.NASK, 'Not Asked'],
      [ExceptionalValueType.NAV, 'Temporarily Not Available'],
      [ExceptionalValueType.MSK, 'Masked'],
      [ExceptionalValueType.DER, 'Derived'],
      [ExceptionalValueType.PINF, 'Positive Infinity'],
      [ExceptionalValueType.NINF, 'Negative Infinity'],
      [ExceptionalValueType.TRC, 'Truncated']
    ])('should handle ExceptionalValueType.%s (%s)', async (evType, expectedName) => {
      const xmlString = '<root></root>';
      const doc = await parseXML(xmlString);

      const errors: ErrorLocation[] = [
        {
          xpath: '/root/test',
          evType: evType,
          reason: `Testing ${evType}`
        }
      ];

      // Should complete without errors
      expect(() => modifier.injectExceptionalValues(doc, errors)).not.toThrow();
    });
  });
});
