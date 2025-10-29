/**
 * Namespace handling utilities
 *
 * @module utils/namespaces
 */


import { SDC4_NAMESPACE, DEFAULT_NAMESPACE_PREFIX } from '../sdc4/constants.js';

/**
 * Ensure SDC4 namespace is declared on the document root.
 *
 * @param doc - XML Document
 * @param prefix - Namespace prefix (default: 'sdc4')
 * @returns The prefix used
 */
export function ensureSDC4Namespace(doc: Document, prefix: string = DEFAULT_NAMESPACE_PREFIX): string {
  const root = doc.documentElement;
  if (!root) {
    throw new Error('Document has no root element');
  }

  const nsAttr = `xmlns:${prefix}`;

  // Check if namespace is already declared
  if (!root.hasAttribute(nsAttr)) {
    root.setAttribute(nsAttr, SDC4_NAMESPACE);
  }

  return prefix;
}

/**
 * Create a namespaced element.
 *
 * @param doc - XML Document
 * @param tagName - Element tag name (without prefix)
 * @param prefix - Namespace prefix
 * @returns Created element
 */
export function createNamespacedElement(
  doc: Document,
  tagName: string,
  prefix: string = DEFAULT_NAMESPACE_PREFIX
): Element {
  return doc.createElementNS(SDC4_NAMESPACE, `${prefix}:${tagName}`);
}

/**
 * Check if an element is an ExceptionalValue element.
 *
 * @param element - Element to check
 * @returns True if element is an ExceptionalValue
 */
export function isExceptionalValueElement(element: Element): boolean {
  if (!element.namespaceURI) {
    return false;
  }

  return element.namespaceURI === SDC4_NAMESPACE &&
         (element.localName === 'INV' ||
          element.localName === 'OTH' ||
          element.localName === 'NI' ||
          element.localName === 'NA' ||
          element.localName === 'UNC' ||
          element.localName === 'UNK' ||
          element.localName === 'ASKU' ||
          element.localName === 'ASKR' ||
          element.localName === 'NASK' ||
          element.localName === 'NAV' ||
          element.localName === 'MSK' ||
          element.localName === 'DER' ||
          element.localName === 'PINF' ||
          element.localName === 'NINF' ||
          element.localName === 'TRC');
}

/**
 * Remove all ExceptionalValue elements from a document.
 *
 * @param doc - XML Document
 */
export function removeExceptionalValues(doc: Document): void {
  const root = doc.documentElement;
  if (!root) {
    return;
  }

  // Find all ExceptionalValue elements
  const toRemove: Element[] = [];
  function walk(node: Element): void {
    if (isExceptionalValueElement(node)) {
      toRemove.push(node);
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child && child.nodeType === 1) { // Element node
        walk(child as Element);
      }
    }
  }

  walk(root);

  // Remove collected elements
  for (const elem of toRemove) {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }
}

/**
 * Get namespace prefix from a qualified name.
 *
 * @param qname - Qualified name (e.g., "sdc4:INV")
 * @returns Prefix or undefined
 */
export function getPrefix(qname: string): string | undefined {
  const parts = qname.split(':');
  return parts.length > 1 ? parts[0] : undefined;
}

/**
 * Get local name from a qualified name.
 *
 * @param qname - Qualified name (e.g., "sdc4:INV")
 * @returns Local name
 */
export function getLocalName(qname: string): string {
  const parts = qname.split(':');
  return parts[parts.length - 1] as string;
}
