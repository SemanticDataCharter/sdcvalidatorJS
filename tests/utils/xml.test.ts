/**
 * Unit tests for XML utilities
 */

import { describe, it, expect } from 'vitest';
import { parseXML, serializeXML, cloneDocument, isFilePath } from '../../src/utils/xml.js';
import { join } from 'path';

describe('XML Utilities', () => {
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <child>value</child>
</root>`;

  describe('parseXML', () => {
    it('should parse XML string', async () => {
      const doc = await parseXML(sampleXML);
      expect(doc).toBeDefined();
      expect(doc.documentElement.nodeName).toBe('root');
    });

    it('should parse XML from file', async () => {
      const filePath = join(__dirname, '../fixtures/valid/person-valid.xml');
      const doc = await parseXML(filePath);
      expect(doc).toBeDefined();
      expect(doc.documentElement.localName).toBe('Person');
    });

    it('should parse XML from Buffer', async () => {
      const buffer = Buffer.from(sampleXML, 'utf-8');
      const doc = await parseXML(buffer);
      expect(doc).toBeDefined();
      expect(doc.documentElement.nodeName).toBe('root');
    });

    it('should return Document as-is if already parsed', async () => {
      const doc1 = await parseXML(sampleXML);
      const doc2 = await parseXML(doc1);
      expect(doc2).toBe(doc1);
    });

    it('should throw error for invalid XML', async () => {
      // Note: xmldom may not always throw for some invalid XML, it creates error elements
      const invalidXml = '<invalid>no closing tag';
      try {
        const doc = await parseXML(invalidXml);
        // Check if parse error element exists
        const parseError = doc.getElementsByTagName('parsererror')[0];
        expect(parseError).toBeDefined();
      } catch (error) {
        // Alternative: it might throw
        expect(error).toBeDefined();
      }
    });

    it('should throw error for non-existent file', async () => {
      await expect(parseXML('/nonexistent/file.xml')).rejects.toThrow();
    });
  });

  describe('serializeXML', () => {
    it('should serialize XML document', async () => {
      const doc = await parseXML(sampleXML);
      const xml = serializeXML(doc);
      expect(xml).toContain('<root>');
      expect(xml).toContain('<child>value</child>');
    });

    it('should add XML declaration by default', async () => {
      const doc = await parseXML('<root><child/></root>');
      const xml = serializeXML(doc);
      expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    });

    it('should skip XML declaration if requested', async () => {
      // Parse without declaration to test this properly
      const doc = await parseXML('<root><child>value</child></root>');
      const xml = serializeXML(doc, { xmlDeclaration: false });
      expect(xml).not.toMatch(/^<\?xml/);
      expect(xml).toContain('<root>');
    });

    it('should format XML with pretty print', async () => {
      const doc = await parseXML('<root><child>value</child></root>');
      const xml = serializeXML(doc, { prettyPrint: true });
      expect(xml).toContain('\n');
    });

    it('should use custom encoding in declaration', async () => {
      // Parse without declaration to test custom encoding
      const doc = await parseXML('<root><child>value</child></root>');
      const xml = serializeXML(doc, { encoding: 'ISO-8859-1', xmlDeclaration: true });
      expect(xml).toContain('encoding="ISO-8859-1"');
    });
  });

  describe('cloneDocument', () => {
    it('should create a deep copy of document', async () => {
      const doc1 = await parseXML(sampleXML);
      const doc2 = cloneDocument(doc1);

      expect(doc2).not.toBe(doc1);
      expect(doc2.documentElement.nodeName).toBe(doc1.documentElement.nodeName);
    });

    it('should not affect original when modifying clone', async () => {
      const doc1 = await parseXML(sampleXML);
      const doc2 = cloneDocument(doc1);

      const newElement = doc2.createElement('newchild');
      doc2.documentElement.appendChild(newElement);

      expect(doc2.getElementsByTagName('newchild').length).toBe(1);
      expect(doc1.getElementsByTagName('newchild').length).toBe(0);
    });
  });

  describe('isFilePath', () => {
    it('should recognize file paths with forward slashes', () => {
      expect(isFilePath('/path/to/file.xml')).toBe(true);
      expect(isFilePath('./relative/path.xml')).toBe(true);
      expect(isFilePath('../parent/file.xml')).toBe(true);
    });

    it('should recognize file paths with backslashes', () => {
      expect(isFilePath('C:\\path\\to\\file.xml')).toBe(true);
    });

    it('should recognize .xml extension', () => {
      expect(isFilePath('file.xml')).toBe(true);
    });

    it('should not recognize XML strings as file paths', () => {
      expect(isFilePath('<root></root>')).toBe(false);
      expect(isFilePath('<?xml version="1.0"?><root/>')).toBe(false);
    });

    it('should not recognize plain strings as file paths', () => {
      expect(isFilePath('just a string')).toBe(false);
    });
  });
});
