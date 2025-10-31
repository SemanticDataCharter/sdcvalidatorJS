/**
 * Unit tests for namespace utilities
 */

import { describe, it, expect } from 'vitest';
import {
  ensureSDC4Namespace,
  createNamespacedElement,
  isExceptionalValueElement,
  removeExceptionalValues,
  getPrefix,
  getLocalName
} from '../../src/utils/namespaces.js';
import { parseXML } from '../../src/utils/xml.js';
import { SDC4_NAMESPACE } from '../../src/sdc4/constants.js';

describe('Namespace Utilities', () => {
  describe('ensureSDC4Namespace', () => {
    it('should add namespace declaration to root element', async () => {
      const doc = await parseXML('<root><child>value</child></root>');
      const prefix = ensureSDC4Namespace(doc, 'sdc4');

      expect(prefix).toBe('sdc4');
      const nsAttr = doc.documentElement.getAttribute('xmlns:sdc4');
      expect(nsAttr).toBe(SDC4_NAMESPACE);
    });

    it('should use default prefix when not specified', async () => {
      const doc = await parseXML('<root/>');
      const prefix = ensureSDC4Namespace(doc);

      expect(prefix).toBe('sdc4');
      const nsAttr = doc.documentElement.getAttribute('xmlns:sdc4');
      expect(nsAttr).toBe(SDC4_NAMESPACE);
    });

    it('should use custom prefix', async () => {
      const doc = await parseXML('<root/>');
      const prefix = ensureSDC4Namespace(doc, 'custom');

      expect(prefix).toBe('custom');
      const nsAttr = doc.documentElement.getAttribute('xmlns:custom');
      expect(nsAttr).toBe(SDC4_NAMESPACE);
    });

    it('should not duplicate namespace if already present', async () => {
      const doc = await parseXML('<root/>');

      // Add once
      ensureSDC4Namespace(doc, 'sdc4');
      const firstAttr = doc.documentElement.getAttribute('xmlns:sdc4');

      // Add again
      ensureSDC4Namespace(doc, 'sdc4');
      const secondAttr = doc.documentElement.getAttribute('xmlns:sdc4');

      // Should be the same
      expect(firstAttr).toBe(secondAttr);
      expect(secondAttr).toBe(SDC4_NAMESPACE);
    });

    it('should throw error if document has no root element', () => {
      const doc = { documentElement: null } as unknown as Document;

      expect(() => ensureSDC4Namespace(doc)).toThrow('Document has no root element');
    });

    it('should preserve existing attributes', async () => {
      const doc = await parseXML('<root id="123" class="test"><child/></root>');
      ensureSDC4Namespace(doc, 'sdc4');

      expect(doc.documentElement.getAttribute('id')).toBe('123');
      expect(doc.documentElement.getAttribute('class')).toBe('test');
      expect(doc.documentElement.getAttribute('xmlns:sdc4')).toBe(SDC4_NAMESPACE);
    });
  });

  describe('createNamespacedElement', () => {
    it('should create element with namespace and prefix', async () => {
      const doc = await parseXML('<root/>');
      const element = createNamespacedElement(doc, 'INV', 'sdc4');

      expect(element.nodeName).toBe('sdc4:INV');
      expect(element.localName).toBe('INV');
      expect(element.namespaceURI).toBe(SDC4_NAMESPACE);
    });

    it('should use default prefix when not specified', async () => {
      const doc = await parseXML('<root/>');
      const element = createNamespacedElement(doc, 'NI');

      expect(element.nodeName).toBe('sdc4:NI');
      expect(element.localName).toBe('NI');
      expect(element.namespaceURI).toBe(SDC4_NAMESPACE);
    });

    it('should create element with custom prefix', async () => {
      const doc = await parseXML('<root/>');
      const element = createNamespacedElement(doc, 'UNK', 'custom');

      expect(element.nodeName).toBe('custom:UNK');
      expect(element.localName).toBe('UNK');
      expect(element.namespaceURI).toBe(SDC4_NAMESPACE);
    });

    it('should create all ExceptionalValue types', async () => {
      const doc = await parseXML('<root/>');
      const types = ['INV', 'OTH', 'NI', 'NA', 'UNC', 'UNK', 'ASKU', 'ASKR',
                     'NASK', 'NAV', 'MSK', 'DER', 'PINF', 'NINF', 'TRC'];

      for (const type of types) {
        const element = createNamespacedElement(doc, type, 'sdc4');
        expect(element.localName).toBe(type);
        expect(element.namespaceURI).toBe(SDC4_NAMESPACE);
      }
    });

    it('should create non-EV elements with SDC4 namespace', async () => {
      const doc = await parseXML('<root/>');
      const element = createNamespacedElement(doc, 'ev-name', 'sdc4');

      expect(element.localName).toBe('ev-name');
      expect(element.namespaceURI).toBe(SDC4_NAMESPACE);
    });
  });

  describe('isExceptionalValueElement', () => {
    it('should recognize all ExceptionalValue types', async () => {
      const doc = await parseXML('<root xmlns:sdc4="https://semanticdatacharter.com/ns/sdc4/"/>');
      const types = ['INV', 'OTH', 'NI', 'NA', 'UNC', 'UNK', 'ASKU', 'ASKR',
                     'NASK', 'NAV', 'MSK', 'DER', 'PINF', 'NINF', 'TRC'];

      for (const type of types) {
        const element = createNamespacedElement(doc, type, 'sdc4');
        expect(isExceptionalValueElement(element)).toBe(true);
      }
    });

    it('should return false for non-EV elements', async () => {
      const doc = await parseXML('<root xmlns:sdc4="https://semanticdatacharter.com/ns/sdc4/"/>');
      const element = createNamespacedElement(doc, 'ev-name', 'sdc4');

      expect(isExceptionalValueElement(element)).toBe(false);
    });

    it('should return false for elements without namespace', async () => {
      const doc = await parseXML('<root><INV>value</INV></root>');
      const element = doc.getElementsByTagName('INV')[0];

      expect(isExceptionalValueElement(element)).toBe(false);
    });

    it('should return false for elements with wrong namespace', async () => {
      // eslint-disable-next-line no-undef
      const parser = new (require('@xmldom/xmldom').DOMParser)();
      const otherDoc = parser.parseFromString(
        '<root xmlns:other="http://other.com/"><other:INV/></root>',
        'text/xml'
      );
      const element = otherDoc.getElementsByTagName('other:INV')[0];

      if (element) {
        expect(isExceptionalValueElement(element)).toBe(false);
      }
    });

    it('should handle regular elements', async () => {
      const doc = await parseXML('<root><person><name>John</name></person></root>');
      const name = doc.getElementsByTagName('name')[0];

      expect(isExceptionalValueElement(name)).toBe(false);
    });
  });

  describe('removeExceptionalValues', () => {
    it('should remove single ExceptionalValue element', async () => {
      const xmlString = `<root xmlns:sdc4="${SDC4_NAMESPACE}">
        <person>
          <name>John</name>
          <sdc4:INV>
            <sdc4:ev-name>Invalid</sdc4:ev-name>
          </sdc4:INV>
        </person>
      </root>`;
      const doc = await parseXML(xmlString);

      // Verify INV element exists
      const invBefore = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      expect(invBefore.length).toBeGreaterThan(0);

      removeExceptionalValues(doc);

      // Verify INV element removed
      const invAfter = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      expect(invAfter.length).toBe(0);

      // Verify other elements remain
      const name = doc.getElementsByTagName('name');
      expect(name.length).toBe(1);
      expect(name[0].textContent).toBe('John');
    });

    it('should remove multiple ExceptionalValue elements', async () => {
      const xmlString = `<root xmlns:sdc4="${SDC4_NAMESPACE}">
        <person>
          <name>John</name>
          <sdc4:INV><sdc4:ev-name>Invalid</sdc4:ev-name></sdc4:INV>
          <sdc4:NI><sdc4:ev-name>No Information</sdc4:ev-name></sdc4:NI>
          <sdc4:UNK><sdc4:ev-name>Unknown</sdc4:ev-name></sdc4:UNK>
        </person>
      </root>`;
      const doc = await parseXML(xmlString);

      removeExceptionalValues(doc);

      // Verify all EV elements removed
      const inv = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      const ni = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'NI');
      const unk = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'UNK');

      expect(inv.length).toBe(0);
      expect(ni.length).toBe(0);
      expect(unk.length).toBe(0);
    });

    it('should remove nested ExceptionalValue elements', async () => {
      const xmlString = `<root xmlns:sdc4="${SDC4_NAMESPACE}">
        <level1>
          <level2>
            <sdc4:INV><sdc4:ev-name>Invalid</sdc4:ev-name></sdc4:INV>
            <level3>
              <sdc4:NI><sdc4:ev-name>No Information</sdc4:ev-name></sdc4:NI>
            </level3>
          </level2>
        </level1>
      </root>`;
      const doc = await parseXML(xmlString);

      removeExceptionalValues(doc);

      const inv = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      const ni = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'NI');

      expect(inv.length).toBe(0);
      expect(ni.length).toBe(0);
    });

    it('should preserve non-EV elements', async () => {
      const xmlString = `<root xmlns:sdc4="${SDC4_NAMESPACE}">
        <person>
          <name>John</name>
          <age>30</age>
          <sdc4:INV><sdc4:ev-name>Invalid</sdc4:ev-name></sdc4:INV>
        </person>
      </root>`;
      const doc = await parseXML(xmlString);

      removeExceptionalValues(doc);

      const name = doc.getElementsByTagName('name');
      const age = doc.getElementsByTagName('age');

      expect(name.length).toBe(1);
      expect(age.length).toBe(1);
      expect(name[0].textContent).toBe('John');
      expect(age[0].textContent).toBe('30');
    });

    it('should handle document with no ExceptionalValue elements', async () => {
      const doc = await parseXML('<root><person><name>John</name></person></root>');

      // Should not throw
      expect(() => removeExceptionalValues(doc)).not.toThrow();

      // Elements should still be there
      const name = doc.getElementsByTagName('name');
      expect(name.length).toBe(1);
    });

    it('should handle document with no root element', () => {
      const doc = { documentElement: null } as unknown as Document;

      // Should not throw
      expect(() => removeExceptionalValues(doc)).not.toThrow();
    });

    it('should remove all 15 ExceptionalValue types', async () => {
      const types = ['INV', 'OTH', 'NI', 'NA', 'UNC', 'UNK', 'ASKU', 'ASKR',
                     'NASK', 'NAV', 'MSK', 'DER', 'PINF', 'NINF', 'TRC'];

      let xmlString = `<root xmlns:sdc4="${SDC4_NAMESPACE}">`;
      for (const type of types) {
        xmlString += `<sdc4:${type}><sdc4:ev-name>${type}</sdc4:ev-name></sdc4:${type}>`;
      }
      xmlString += '</root>';

      const doc = await parseXML(xmlString);

      removeExceptionalValues(doc);

      // Verify all are removed
      for (const type of types) {
        const elements = doc.getElementsByTagNameNS(SDC4_NAMESPACE, type);
        expect(elements.length).toBe(0);
      }
    });
  });

  describe('getPrefix', () => {
    it('should extract prefix from qualified name', () => {
      expect(getPrefix('sdc4:INV')).toBe('sdc4');
      expect(getPrefix('custom:NI')).toBe('custom');
      expect(getPrefix('ns:element')).toBe('ns');
    });

    it('should return undefined for unprefixed name', () => {
      expect(getPrefix('element')).toBeUndefined();
      expect(getPrefix('INV')).toBeUndefined();
    });

    it('should handle multiple colons', () => {
      expect(getPrefix('a:b:c')).toBe('a');
    });

    it('should handle empty string', () => {
      expect(getPrefix('')).toBeUndefined();
    });
  });

  describe('getLocalName', () => {
    it('should extract local name from qualified name', () => {
      expect(getLocalName('sdc4:INV')).toBe('INV');
      expect(getLocalName('custom:NI')).toBe('NI');
      expect(getLocalName('ns:element')).toBe('element');
    });

    it('should return full name for unprefixed name', () => {
      expect(getLocalName('element')).toBe('element');
      expect(getLocalName('INV')).toBe('INV');
    });

    it('should handle multiple colons', () => {
      expect(getLocalName('a:b:c')).toBe('c');
    });

    it('should handle empty string', () => {
      expect(getLocalName('')).toBe('');
    });

    it('should handle colon at end', () => {
      expect(getLocalName('prefix:')).toBe('');
    });
  });

  describe('Integration', () => {
    it('should work together to manage namespaces', async () => {
      const doc = await parseXML('<root><person><name>John</name></person></root>');

      // Add namespace
      ensureSDC4Namespace(doc, 'sdc4');

      // Create and append ExceptionalValue element
      const inv = createNamespacedElement(doc, 'INV', 'sdc4');
      const evName = createNamespacedElement(doc, 'ev-name', 'sdc4');
      evName.textContent = 'Invalid';
      inv.appendChild(evName);
      doc.documentElement.appendChild(inv);

      // Verify it's recognized as EV
      expect(isExceptionalValueElement(inv)).toBe(true);

      // Remove it
      removeExceptionalValues(doc);

      // Verify it's gone
      const invElements = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      expect(invElements.length).toBe(0);
    });

    it('should handle mixed prefixes', async () => {
      const doc = await parseXML('<root/>');

      ensureSDC4Namespace(doc, 'ns1');
      const elem1 = createNamespacedElement(doc, 'INV', 'ns1');
      doc.documentElement.appendChild(elem1);

      ensureSDC4Namespace(doc, 'ns2');
      const elem2 = createNamespacedElement(doc, 'NI', 'ns2');
      doc.documentElement.appendChild(elem2);

      // Both should be recognized as EV elements (same namespace, different prefix)
      expect(isExceptionalValueElement(elem1)).toBe(true);
      expect(isExceptionalValueElement(elem2)).toBe(true);

      // Remove should remove both
      removeExceptionalValues(doc);
      const invElements = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'INV');
      const niElements = doc.getElementsByTagNameNS(SDC4_NAMESPACE, 'NI');
      expect(invElements.length).toBe(0);
      expect(niElements.length).toBe(0);
    });
  });
});
