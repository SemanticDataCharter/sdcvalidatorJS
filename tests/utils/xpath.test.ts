/**
 * Unit tests for XPath utilities
 */

import { describe, it, expect } from 'vitest';
import {
  selectNodes,
  selectSingleNode,
  getElementPath,
  selectValue
} from '../../src/utils/xpath.js';
import { parseXML } from '../../src/utils/xml.js';

describe('XPath Utilities', () => {
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person id="1">
    <name>John Doe</name>
    <age>30</age>
    <email>john@example.com</email>
  </person>
  <person id="2">
    <name>Jane Smith</name>
    <age>25</age>
    <email>jane@example.com</email>
  </person>
  <metadata>
    <created>2024-01-01</created>
    <version>1.0</version>
  </metadata>
</root>`;

  describe('selectNodes', () => {
    it('should select multiple nodes matching XPath', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//person', doc);

      expect(nodes.length).toBe(2);
      expect(nodes[0].nodeName).toBe('person');
      expect(nodes[1].nodeName).toBe('person');
    });

    it('should select nodes by tag name', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//name', doc);

      expect(nodes.length).toBe(2);
      expect(nodes[0].textContent).toBe('John Doe');
      expect(nodes[1].textContent).toBe('Jane Smith');
    });

    it('should select nodes with predicate', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//person[@id="1"]', doc);

      expect(nodes.length).toBe(1);
      expect(nodes[0].getAttribute('id')).toBe('1');
    });

    it('should return empty array for no matches', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//nonexistent', doc);

      expect(nodes).toEqual([]);
    });

    it('should handle absolute path', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('/root/metadata', doc);

      expect(nodes.length).toBe(1);
      expect(nodes[0].nodeName).toBe('metadata');
    });

    it('should handle child selection', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('/root/person/name', doc);

      expect(nodes.length).toBe(2);
      expect(nodes[0].textContent).toBe('John Doe');
      expect(nodes[1].textContent).toBe('Jane Smith');
    });

    it('should handle invalid XPath gracefully', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//[invalid', doc);

      // Should return empty array instead of throwing
      expect(Array.isArray(nodes)).toBe(true);
    });

    it('should work with element context', async () => {
      const doc = await parseXML(sampleXML);
      const person = selectSingleNode('//person[@id="1"]', doc);
      expect(person).toBeDefined();

      if (person) {
        const names = selectNodes('.//name', person);
        expect(names.length).toBe(1);
        expect(names[0].textContent).toBe('John Doe');
      }
    });

    it('should select all elements with wildcard', async () => {
      const doc = await parseXML(sampleXML);
      const rootElement = doc.documentElement;
      const allChildren = selectNodes('./*', rootElement);

      expect(allChildren.length).toBe(3); // 2 person + 1 metadata
    });
  });

  describe('selectSingleNode', () => {
    it('should select first matching node', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('//person', doc);

      expect(node).toBeDefined();
      expect(node?.nodeName).toBe('person');
      expect(node?.getAttribute('id')).toBe('1');
    });

    it('should return undefined for no match', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('//nonexistent', doc);

      expect(node).toBeUndefined();
    });

    it('should select specific node with predicate', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('//person[@id="2"]', doc);

      expect(node).toBeDefined();
      expect(node?.getAttribute('id')).toBe('2');
    });

    it('should handle absolute path', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('/root/metadata', doc);

      expect(node).toBeDefined();
      expect(node?.nodeName).toBe('metadata');
    });

    it('should handle child selection', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('/root/person[1]/name', doc);

      expect(node).toBeDefined();
      expect(node?.textContent).toBe('John Doe');
    });

    it('should handle invalid XPath gracefully', async () => {
      const doc = await parseXML(sampleXML);
      const node = selectSingleNode('//[invalid', doc);

      expect(node).toBeUndefined();
    });

    it('should work with element context', async () => {
      const doc = await parseXML(sampleXML);
      const person = selectSingleNode('//person[@id="2"]', doc);
      expect(person).toBeDefined();

      if (person) {
        const name = selectSingleNode('.//name', person);
        expect(name).toBeDefined();
        expect(name?.textContent).toBe('Jane Smith');
      }
    });

    it('should select root element', async () => {
      const doc = await parseXML(sampleXML);
      const root = selectSingleNode('/root', doc);

      expect(root).toBeDefined();
      expect(root?.nodeName).toBe('root');
    });
  });

  describe('getElementPath', () => {
    it('should generate path for single element', async () => {
      const doc = await parseXML('<root><child>value</child></root>');
      const child = selectSingleNode('//child', doc);

      expect(child).toBeDefined();
      if (child) {
        const path = getElementPath(child);
        expect(path).toBe('/root/child');
      }
    });

    it('should generate path for nested elements', async () => {
      const doc = await parseXML('<root><level1><level2><level3>value</level3></level2></level1></root>');
      const level3 = selectSingleNode('//level3', doc);

      expect(level3).toBeDefined();
      if (level3) {
        const path = getElementPath(level3);
        expect(path).toBe('/root/level1/level2/level3');
      }
    });

    it('should handle elements with same name siblings', async () => {
      const doc = await parseXML('<root><item>1</item><item>2</item><item>3</item></root>');
      const items = selectNodes('//item', doc);

      expect(items.length).toBe(3);

      const path1 = getElementPath(items[0]);
      const path2 = getElementPath(items[1]);
      const path3 = getElementPath(items[2]);

      expect(path1).toBe('/root/item');
      expect(path2).toBe('/root/item[2]');
      expect(path3).toBe('/root/item[3]');
    });

    it('should generate path for root element', async () => {
      const doc = await parseXML('<root><child>value</child></root>');
      const root = doc.documentElement;

      const path = getElementPath(root);
      expect(path).toBe('/root');
    });

    it('should handle complex structure', async () => {
      const doc = await parseXML(sampleXML);
      const email = selectSingleNode('//person[@id="2"]/email', doc);

      expect(email).toBeDefined();
      if (email) {
        const path = getElementPath(email);
        expect(path).toBe('/root/person[2]/email');
      }
    });

    it('should handle deeply nested elements', async () => {
      const doc = await parseXML('<root><a><b><c><d><e>value</e></d></c></b></a></root>');
      const e = selectSingleNode('//e', doc);

      expect(e).toBeDefined();
      if (e) {
        const path = getElementPath(e);
        expect(path).toBe('/root/a/b/c/d/e');
      }
    });
  });

  describe('selectValue', () => {
    it('should extract text content from element', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//person[@id="1"]/name', doc);

      expect(value).toBe('John Doe');
    });

    it('should extract text from nested element', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//metadata/version', doc);

      expect(value).toBe('1.0');
    });

    it('should return first match for multiple nodes', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//name', doc);

      expect(value).toBe('John Doe'); // First match
    });

    it('should return empty string for no match', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//nonexistent', doc);

      expect(value).toBe('');
    });

    it('should handle invalid XPath gracefully', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//[invalid', doc);

      expect(value).toBe('');
    });

    it('should extract numeric value as string', async () => {
      const doc = await parseXML(sampleXML);
      const value = selectValue('//person[@id="1"]/age', doc);

      expect(value).toBe('30');
    });

    it('should work with element context', async () => {
      const doc = await parseXML(sampleXML);
      const person = selectSingleNode('//person[@id="2"]', doc);

      expect(person).toBeDefined();
      if (person) {
        const value = selectValue('.//age', person);
        expect(value).toBe('25');
      }
    });

    it('should handle empty elements', async () => {
      const doc = await parseXML('<root><empty/></root>');
      const value = selectValue('//empty', doc);

      expect(value).toBe('');
    });

    it('should handle whitespace in text content', async () => {
      const doc = await parseXML('<root><item>  spaced  </item></root>');
      const value = selectValue('//item', doc);

      expect(value).toBe('  spaced  ');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal XML document', async () => {
      const doc = await parseXML('<root/>');
      const nodes = selectNodes('//root', doc);

      expect(nodes.length).toBe(1);
    });

    it('should handle XML with namespaces', async () => {
      const nsXml = `<root xmlns:ns="http://example.com/ns">
        <ns:item>value</ns:item>
      </root>`;
      const doc = await parseXML(nsXml);

      // XPath without namespace handling
      const nodes = selectNodes('//*[local-name()="item"]', doc);
      expect(nodes.length).toBe(1);
    });

    it('should handle attributes in XPath', async () => {
      const doc = await parseXML(sampleXML);
      const nodes = selectNodes('//person[@id]', doc);

      expect(nodes.length).toBe(2);
      expect(nodes[0].hasAttribute('id')).toBe(true);
      expect(nodes[1].hasAttribute('id')).toBe(true);
    });

    it('should handle text() nodes in XPath', async () => {
      const doc = await parseXML('<root><item>text</item></root>');
      const value = selectValue('//item/text()', doc);

      expect(value).toBe('text');
    });
  });
});
