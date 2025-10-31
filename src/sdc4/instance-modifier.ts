/**
 * InstanceModifier - Injects ExceptionalValue elements into XML DOM
 *
 * @module sdc4/instance-modifier
 */


import type { ExceptionalValueType} from './constants.js';
import { EXCEPTIONAL_VALUE_METADATA } from './constants.js';
import { createNamespacedElement, ensureSDC4Namespace } from '../utils/namespaces.js';
import { selectSingleNode } from '../utils/xpath.js';

/**
 * Error location information for injecting ExceptionalValues.
 */
export interface ErrorLocation {
  xpath: string;
  evType: ExceptionalValueType;
  reason: string;
}

/**
 * Modifies XML instances by injecting ExceptionalValue elements.
 */
export class InstanceModifier {
  private namespacePrefix: string;

  constructor(namespacePrefix: string = 'sdc4') {
    this.namespacePrefix = namespacePrefix;
  }

  /**
   * Inject ExceptionalValue elements for all error locations.
   *
   * @param doc - XML Document
   * @param errors - Array of error locations
   * @returns Modified document (same instance, modified in place)
   */
  injectExceptionalValues(doc: Document, errors: ErrorLocation[]): Document {
    // Ensure SDC4 namespace is declared
    ensureSDC4Namespace(doc, this.namespacePrefix);

    // Group errors by parent element to handle multiple errors in same location
    const errorsByParent = this.groupErrorsByParent(errors);

    // Inject ExceptionalValue elements
    for (const [parentPath, parentErrors] of errorsByParent.entries()) {
      this.injectAtLocation(doc, parentPath, parentErrors);
    }

    return doc;
  }

  /**
   * Group errors by their parent element path.
   *
   * @param errors - Array of error locations
   * @returns Map of parent paths to errors
   */
  private groupErrorsByParent(errors: ErrorLocation[]): Map<string, ErrorLocation[]> {
    const groups = new Map<string, ErrorLocation[]>();

    for (const error of errors) {
      // Get parent path (remove last segment)
      const parentPath = this.getParentPath(error.xpath);

      if (!groups.has(parentPath)) {
        groups.set(parentPath, []);
      }
      groups.get(parentPath)?.push(error);
    }

    return groups;
  }

  /**
   * Get parent path from an XPath expression.
   *
   * @param xpath - XPath expression
   * @returns Parent path
   */
  private getParentPath(xpath: string): string {
    const parts = xpath.split('/').filter((p) => p.length > 0);
    if (parts.length <= 1) {
      return '/';
    }
    parts.pop();
    return '/' + parts.join('/');
  }

  /**
   * Inject ExceptionalValue elements at a specific location.
   *
   * @param doc - XML Document
   * @param parentPath - XPath to parent element
   * @param errors - Errors to inject at this location
   */
  private injectAtLocation(doc: Document, parentPath: string, errors: ErrorLocation[]): void {
    // Find parent element
    const parent = this.findElement(doc, parentPath);
    if (!parent) {
      console.warn(`Could not find parent element at path: ${parentPath}`);
      return;
    }

    // Inject ExceptionalValue elements for each error
    for (const error of errors) {
      try {
        const evElement = this.createExceptionalValueElement(doc, error);
        this.insertElement(parent, evElement, error.xpath);
      } catch (err) {
        console.warn(`Failed to inject ExceptionalValue at ${error.xpath}:`, err);
      }
    }
  }

  /**
   * Find an element by XPath.
   *
   * @param doc - XML Document
   * @param xpath - XPath expression
   * @returns Element or undefined
   */
  private findElement(doc: Document, xpath: string): Element | undefined {
    if (xpath === '/' || xpath === '') {
      return doc.documentElement;
    }

    return selectSingleNode(xpath, doc);
  }

  /**
   * Create an ExceptionalValue element.
   *
   * @param doc - XML Document
   * @param error - Error location
   * @returns Created element
   */
  private createExceptionalValueElement(doc: Document, error: ErrorLocation): Element {
    const metadata = EXCEPTIONAL_VALUE_METADATA[error.evType];

    // Create main ExceptionalValue element (e.g., <sdc4:INV>)
    const evElement = createNamespacedElement(doc, metadata.code, this.namespacePrefix);

    // Create and add ev-name child element
    const nameElement = createNamespacedElement(doc, 'ev-name', this.namespacePrefix);
    nameElement.textContent = metadata.name;
    evElement.appendChild(nameElement);

    // Optionally add comment with error reason
    if (error.reason) {
      const comment = doc.createComment(` Validation error: ${error.reason} `);
      evElement.appendChild(doc.createTextNode('\n  '));
      evElement.appendChild(comment);
      evElement.appendChild(doc.createTextNode('\n'));
    }

    return evElement;
  }

  /**
   * Insert an element at the appropriate position in its parent.
   *
   * @param parent - Parent element
   * @param newElement - Element to insert
   * @param _targetXPath - XPath of where element should be inserted
   */
  // eslint-disable-next-line no-unused-vars
  private insertElement(parent: Element, newElement: Element, _targetXPath: string): void {
    // For now, insert as first child to preserve order
    // In a more sophisticated implementation, we would analyze the schema
    // to determine the correct sequence position
    if (parent.firstChild) {
      parent.insertBefore(newElement, parent.firstChild);
      // Add newline for formatting
      parent.insertBefore(parent.ownerDocument.createTextNode('\n  '), newElement);
    } else {
      parent.appendChild(newElement);
    }
  }

  /**
   * Set the namespace prefix for ExceptionalValue elements.
   *
   * @param prefix - Namespace prefix
   */
  setNamespacePrefix(prefix: string): void {
    this.namespacePrefix = prefix;
  }

  /**
   * Get the current namespace prefix.
   *
   * @returns Namespace prefix
   */
  getNamespacePrefix(): string {
    return this.namespacePrefix;
  }
}
