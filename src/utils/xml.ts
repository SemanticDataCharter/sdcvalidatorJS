/**
 * XML parsing and serialization utilities
 *
 * @module utils/xml
 */

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFile } from 'fs/promises';
import type { XMLSource } from '../types/validator.js';

/**
 * Parse XML from various sources.
 *
 * @param source - XML source (file path, string, Buffer, or Document)
 * @returns Parsed XML Document
 */
export async function parseXML(source: XMLSource): Promise<Document> {
  if (typeof source === 'object' && 'nodeType' in source) {
    // Already a Document
    return source as Document;
  }

  let xmlString: string;

  if (typeof source === 'string') {
    // Check if it's a file path or XML string
    if (source.trim().startsWith('<')) {
      xmlString = source;
    } else {
      // Treat as file path
      const buffer = await readFile(source);
      xmlString = buffer.toString('utf-8');
    }
  } else {
    // Buffer
    xmlString = source.toString('utf-8');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parse errors
  const parseError = doc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent}`);
  }

  return doc;
}

/**
 * Serialize XML Document to string.
 *
 * @param doc - XML Document
 * @param options - Serialization options
 * @returns Serialized XML string
 */
export function serializeXML(
  doc: Document,
  options: {
    prettyPrint?: boolean;
    xmlDeclaration?: boolean;
    encoding?: string;
  } = {}
): string {
  const { prettyPrint = true, xmlDeclaration = true, encoding = 'UTF-8' } = options;

  const serializer = new XMLSerializer();
  let xml = serializer.serializeToString(doc);

  // Add XML declaration if requested and not present
  if (xmlDeclaration && !xml.startsWith('<?xml')) {
    xml = `<?xml version="1.0" encoding="${encoding}"?>\n${xml}`;
  }

  // Basic pretty printing (naive implementation)
  if (prettyPrint) {
    xml = formatXML(xml);
  }

  return xml;
}

/**
 * Basic XML formatting for readability.
 * Note: This is a simple implementation. For production use, consider a proper XML formatter.
 *
 * @param xml - XML string
 * @returns Formatted XML string
 */
function formatXML(xml: string): string {
  const PADDING = '  '; // 2 spaces
  const reg = /(>)(<)(\/*)/g;
  let formatted = '';
  let pad = 0;

  xml = xml.replace(reg, '$1\n$2$3');

  const lines = xml.split('\n');
  for (const line of lines) {
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      // Same line opening and closing tag
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      // Closing tag
      if (pad > 0) {
        pad -= 1;
      }
    } else if (line.match(/^<\w([^>]*[^/])?>.*$/)) {
      // Opening tag
      indent = 1;
    }

    formatted += PADDING.repeat(pad) + line + '\n';
    pad += indent;
  }

  return formatted.trim();
}

/**
 * Clone an XML Document.
 *
 * @param doc - XML Document to clone
 * @returns Cloned Document
 */
export function cloneDocument(doc: Document): Document {
  const serializer = new XMLSerializer();
  const xml = serializer.serializeToString(doc);
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'text/xml');
}

/**
 * Check if a string appears to be an XML file path.
 *
 * @param str - String to check
 * @returns True if appears to be a file path
 */
export function isFilePath(str: string): boolean {
  return !str.trim().startsWith('<') && (str.includes('/') || str.includes('\\') || str.endsWith('.xml'));
}
