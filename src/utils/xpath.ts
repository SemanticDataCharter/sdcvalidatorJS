/**
 * XPath evaluation utilities
 *
 * @module utils/xpath
 */

import xpath from 'xpath';


/**
 * Evaluate XPath expression and return matching nodes.
 *
 * @param expression - XPath expression
 * @param contextNode - Context node for evaluation
 * @returns Array of matching nodes
 */
export function selectNodes(expression: string, contextNode: Document | Element): Element[] {
  try {
    const result = xpath.select(expression, contextNode);
    if (Array.isArray(result)) {
      return result as Element[];
    }
    return [];
  } catch (error) {
    console.warn(`XPath evaluation failed: ${expression}`, error);
    return [];
  }
}

/**
 * Evaluate XPath expression and return first matching node.
 *
 * @param expression - XPath expression
 * @param contextNode - Context node for evaluation
 * @returns First matching node or undefined
 */
export function selectSingleNode(expression: string, contextNode: Document | Element): Element | undefined {
  try {
    const result = xpath.select1(expression, contextNode);
    return result as Element | undefined;
  } catch (error) {
    console.warn(`XPath evaluation failed: ${expression}`, error);
    return undefined;
  }
}

/**
 * Get XPath expression for an element.
 * Note: This is a simplified implementation.
 *
 * @param element - Element to get path for
 * @returns XPath expression
 */
export function getElementPath(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === 1) {
    let index = 1;
    let sibling = current.previousSibling;

    // Count preceding siblings with same name
    while (sibling) {
      if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const part = current.nodeName + (index > 1 ? `[${index}]` : '');
    parts.unshift(part);

    current = current.parentNode as Element | null;
    if (current && current.nodeType === 9) { // Document node
      break;
    }
  }

  return '/' + parts.join('/');
}

/**
 * Evaluate XPath expression and return string value.
 *
 * @param expression - XPath expression
 * @param contextNode - Context node for evaluation
 * @returns String value
 */
export function selectValue(expression: string, contextNode: Document | Element): string {
  try {
    const result = xpath.select(expression, contextNode);
    if (typeof result === 'string') {
      return result;
    }
    if (typeof result === 'number') {
      return result.toString();
    }
    if (typeof result === 'boolean') {
      return result.toString();
    }
    if (Array.isArray(result) && result.length > 0) {
      return result[0]?.textContent || '';
    }
    return '';
  } catch (error) {
    console.warn(`XPath evaluation failed: ${expression}`, error);
    return '';
  }
}
