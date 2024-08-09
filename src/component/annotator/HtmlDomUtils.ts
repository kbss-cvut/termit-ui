import { Node as DomHandlerNode } from "domhandler";
import Utils from "../../util/Utils";
import { TextQuoteSelector } from "../../model/TermOccurrence";
import { AnnotationType } from "./AnnotationDomHelper";
import { fromNode, toNode } from "simple-xpath-position";
import * as React from "react";
import TextSelection from "./TextSelection";

export const BLOCK_ELEMENTS = [
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "dialog",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
];

export interface HtmlSplit {
  prefix: string;
  body: string;
  suffix: string;
}

const HtmlDomUtils = {
  /**
   * Returns true if there is a non-empty selection in the current window.
   */
  hasSelection(): boolean {
    const sel = window.getSelection();
    return sel !== null && !sel.isCollapsed;
  },

  /**
   * Gets the selected range in the current window, if present and not empty.
   *
   * @return Range | null Selected range or null if there is none
   */
  getSelectionRange(): Range | null {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      return sel.getRangeAt(0);
    }
    return null;
  },

  splitHtml(htmlContent: string): HtmlSplit {
    const htmlSplit = htmlContent.split(/(<body.*>|<\/body>)/gi);

    if (htmlSplit.length === 5) {
      return {
        prefix: htmlSplit[0] + htmlSplit[1],
        body: htmlSplit[2],
        suffix: htmlSplit[3] + htmlSplit[4],
      };
    }
    return {
      prefix: "",
      body: htmlContent,
      suffix: "",
    };
  },

  /**
   * Checks whether the specified selection is in a popper.js popup.
   * @param range Range to check
   */
  isInPopup(range: Range): boolean {
    const commonAnc = range.commonAncestorContainer;
    return (
      commonAnc.parentElement !== null &&
      commonAnc.parentElement.closest(".popover") !== null
    );
  },

  resolvePopupPosition(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const annotatorElem = document.getElementById("annotator")!;
    const fontSize = parseFloat(
      window.getComputedStyle(annotatorElem).getPropertyValue("font-size")
    );
    return {
      x: e.clientX,
      y: e.clientY - fontSize / 2,
    };
  },

  /**
   * Extends and trims the selection so as not to contain leading/trailing spaces or punctuation characters.
   * @param container
   */
  extendSelectionToWords(container: Node) {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const selectionModifier = new TextSelection(sel, container);

      selectionModifier.adjustStart();
      selectionModifier.adjustEnd();
      selectionModifier.restoreSelection();

      // Note that we are not using sel.modify by word due to issues with Firefox messing up the modification/extension
      // in certain situations (Bug #1610)
    }
  },

  /**
   * Returns true if the range starts in one element and ends in another (except text nodes).
   *
   * This can cause problems for annotation generation.
   * @param range Range to check
   */
  doesRangeSpanMultipleElements(range: Range): boolean {
    return (
      // either they have the same parent node
      // and they are different nodes
      (range.startContainer.parentNode === range.endContainer.parentNode &&
        range.startContainer !== range.endContainer &&
        // and one of them is not a text node
        (range.startContainer.nodeType !== Node.TEXT_NODE ||
          range.endContainer.nodeType !== Node.TEXT_NODE)) ||
      // or they have different parent
      range.startContainer.parentNode !== range.endContainer.parentNode
    );
  },

  /**
   * Extends the specified range (if necessary) to prevent its replacement from crossing multiple elements.
   *
   * This extension should handle situations when the range starts in one element and ends in another, which would
   * prevent its replacement/annotation due to invalid element boundary crossing. This method attempts to fix this by
   * extending the range to contain both starting and ending elements.
   * @param range Range to fix
   */
  extendRangeToPreventNodeCrossing(range: Range): void {
    if (this.doesRangeSpanMultipleElements(range)) {
      const startingChild = findLastParentBefore(
        range.startContainer,
        range.commonAncestorContainer
      );
      const endingChild = findLastParentBefore(
        range.endContainer,
        range.commonAncestorContainer
      );

      if (startingChild !== range.commonAncestorContainer) {
        range.setStartBefore(startingChild);
      } else {
        range.setStart(range.commonAncestorContainer, 0);
      }
      if (endingChild !== range.commonAncestorContainer) {
        range.setEndAfter(endingChild);
      } else {
        let offset = 0;
        // just to be sure
        if (range.commonAncestorContainer.hasChildNodes()) {
          offset = range.commonAncestorContainer.childNodes.length - 1;
        } else {
          const text = range.commonAncestorContainer.textContent || "";
          offset = text.length - 1;
        }
        range.setEnd(range.commonAncestorContainer, offset);
      }
    }
  },

  /**
   * Returns a clone of rootElement where range is replaced by provided surroundingElement.
   * @param rootElement Root element of a document that should be cloned.
   * @param range range within document referenced by rootElement that should be surrounded.
   * @param surroundingElementHtml string representing surroundingElement.
   */
  replaceRange(
    rootElement: HTMLElement,
    range: Range,
    surroundingElementHtml: string
  ): HTMLElement {
    const startXpath = fromNode(range.startContainer, rootElement) || ".";
    const endXpath = fromNode(range.endContainer, rootElement) || ".";
    const clonedElement = rootElement.cloneNode(true) as HTMLElement;

    const startElement: Node | null = toNode(startXpath, clonedElement);
    const endElement: Node | null = toNode(endXpath, clonedElement);

    if (!startElement || !endElement) {
      throw new Error("Unable to resolve selected range");
    }

    const newRange = new Range();
    newRange.setStart(startElement, range.startOffset);
    newRange.setEnd(endElement, range.endOffset);

    const doc = clonedElement.ownerDocument;
    const template = doc!.createElement("template");
    template.innerHTML = surroundingElementHtml;
    const surroundingElement = template.content;

    newRange.extractContents();
    newRange.insertNode(surroundingElement.children[0]);
    return clonedElement;
  },

  /**
   * Retrieves the text content of the specified nodes.
   *
   * Text node content is retrieved directly, element content is retrieved by recursively looking for text nodes they
   * contain.
   * @param nodes Nodes to process
   */
  getTextContent(nodes: DomHandlerNode[] | DomHandlerNode): string {
    return Utils.sanitizeArray(nodes)
      .map((n: any) => {
        if (n.type === "text") {
          return n.data;
        } else {
          return this.getTextContent(n.children);
        }
      })
      .join("");
  },

  getRangeContent(range: Range) {
    if (!range) {
      throw new Error("Range " + range + " not defined.");
    }
    const fragment = range.cloneContents();
    return fragment.childNodes;
  },

  containsBlockElement(nodeList: NodeList): boolean {
    if (!nodeList) {
      return false;
    }
    for (let i = 0; i < nodeList.length; i++) {
      const n: Node | null = nodeList.item(i);
      if (n !== null && n.nodeType === Node.ELEMENT_NODE) {
        if (BLOCK_ELEMENTS.indexOf(n.nodeName.toLowerCase()) !== -1) {
          return true;
        }
        const r = this.containsBlockElement(n.childNodes);
        if (r) {
          return true;
        }
      }
    }
    return false;
  },

  /**
   * Generates a virtual element at the specified position.
   *
   * This element can be used as an anchor for a popup.
   * @param x X-coordinate of the virtual element
   * @param y Y-coordinate of the virtual element
   */
  generateVirtualElement(x: number, y: number): HTMLElement {
    return {
      getBoundingClientRect: () => {
        return {
          width: 0,
          height: 0,
          top: y,
          right: x,
          bottom: y,
          left: x,
        };
      },
      addEventListener: () => {
        /* Intentionally empty */
      },
      removeEventListener: () => {
        /* Intentionally empty */
      },
      contains: () => false,
    } as unknown as HTMLElement;
  },

  findAnnotationElementBySelector(
    document: Document,
    selector: TextQuoteSelector
  ): Element {
    const occurrences = document
      .getElementById("annotator")!
      .querySelectorAll(`[typeof="${AnnotationType.OCCURRENCE}"]`);
    const matching: Element[] = [];
    const looseCandidates: Element[] = [];
    occurrences.forEach((o) => {
      if (o.textContent === selector.exactMatch) {
        matching.push(o);
      }
    });
    const definitions = document
      .getElementById("annotator")!
      .querySelectorAll(`[typeof="${AnnotationType.DEFINITION}"]`);
    definitions.forEach((d) => {
      if (d.textContent === selector.exactMatch) {
        matching.push(d);
      } else if (
        d.textContent &&
        d.textContent.replace(/\s/g, "") ===
          selector.exactMatch.replace(/\s/g, "")
      ) {
        // If the exact match didn't work, try removing all spaces and checking again
        looseCandidates.push(d);
      }
    });
    if (matching.length === 1) {
      return matching[0];
    }
    for (const elem of matching) {
      if (prefixMatch(selector, elem) && suffixMatch(selector, elem)) {
        return elem;
      }
    }
    if (looseCandidates.length === 1) {
      return looseCandidates[0];
    }
    for (const elem of looseCandidates) {
      if (prefixMatch(selector, elem) && suffixMatch(selector, elem)) {
        return elem;
      }
    }
    throw new Error(
      `Element with exact match '${selector.exactMatch}' not found in document.`
    );
  },

  addClassToElement(element: Element, className: string) {
    element.classList.add(className);
  },

  removeClassFromElement(element: Element, className: string) {
    element.classList.remove(className);
  },
};

function findLastParentBefore(child: Node, parent: Node) {
  let node = child;
  while (node && node.parentNode && node.parentNode !== parent) {
    node = node.parentNode;
  }
  return node;
}

function prefixMatch(selector: TextQuoteSelector, element: Element) {
  return (
    selector.prefix &&
    element.previousSibling &&
    element.previousSibling.textContent &&
    element.previousSibling.textContent!.indexOf(selector.prefix) !== -1
  );
}

function suffixMatch(selector: TextQuoteSelector, element: Element) {
  return (
    selector.suffix &&
    element.nextSibling &&
    element.nextSibling.textContent &&
    element.nextSibling.textContent!.indexOf(selector.suffix) !== -1
  );
}

export function getTermOccurrences(termIri: string) {
  return document
    .getElementById("annotator")!
    .querySelectorAll(`span[resource="${termIri}"]`);
}

export default HtmlDomUtils;
