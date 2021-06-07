import {Node as DomHandlerNode} from "domhandler";
import Utils from "../../util/Utils";
import {TextQuoteSelector} from "../../model/TermOccurrence";
import {AnnotationType} from "./AnnotationDomHelper";
import {fromRange, toRange} from "xpath-range";

const BLOCK_ELEMENTS = [
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

function calculatePathLength(node: Node, ancestor: Node) {
  let parent = node.parentNode;
  let length = 0;
  while (parent && parent !== ancestor) {
    length++;
    parent = parent.parentNode;
  }
  return length;
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

  extendSelectionToWords() {
    const sel = window.getSelection();
    // @ts-ignore
    if (sel && !sel.isCollapsed && sel.modify) {
      // Detect if selection is backwards
      const range = document.createRange();
      // @ts-ignore
      range.setStart(sel.anchorNode, sel.anchorOffset);
      // @ts-ignore
      range.setEnd(sel.focusNode, sel.focusOffset);
      const backwards = range.collapsed;
      range.detach();

      // modify() works on the focus of the selection
      const endNode = sel.focusNode;
      const endOffset =
        sel.focusOffset !== 0 ? sel.focusOffset - 1 : sel.focusOffset;
      sel.collapse(
        sel.anchorNode,
        backwards ? sel.anchorOffset : sel.anchorOffset + 1
      );
      if (backwards) {
        // @ts-ignore
        sel.modify("move", "forward", "word");
        // @ts-ignore
        sel.extend(endNode, endOffset);
        // @ts-ignore
        sel.modify("extend", "backward", "word");
      } else {
        // @ts-ignore
        sel.modify("move", "backward", "word");
        // @ts-ignore
        sel.extend(endNode, endOffset);
        // @ts-ignore
        sel.modify("extend", "forward", "word");
      }
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
      range.startContainer !== range.endContainer &&
      calculatePathLength(
        range.startContainer,
        range.commonAncestorContainer
      ) !==
        calculatePathLength(range.endContainer, range.commonAncestorContainer)
    );
  },

  /**
   * Extends the specified range (if necessary) to prevent its replacement from crossing multiple elements.
   *
   * This extension should handle situations when the range starts in one element and ends in another, which would
   * prevent its replacement/annotation due to invalid element boundary crossing. This method attempts to fix this by
   * extending the range to be the contents of the closest common ancestor of the range's start and end containers.
   * @param range Range to fix
   */
  extendRangeToPreventNodeCrossing(range: Range) {
    if (this.doesRangeSpanMultipleElements(range)) {
      range.selectNodeContents(range.commonAncestorContainer);
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
    const xpathRange = fromRange(range, rootElement);
    const clonedElement = rootElement.cloneNode(true) as HTMLElement;
    const newRange = toRange(
      xpathRange.start,
      xpathRange.startOffset,
      xpathRange.end,
      range.endContainer.nodeType === Node.TEXT_NODE ? xpathRange.endOffset : 0,
      clonedElement
    );
    // This works around the issue that the toRange considers the offsets as textual characters, but if the end container is
    // not a text node, the offset represents the number of elements before it and thus the offset in the newRange would be incorrect
    // See https://developer.mozilla.org/en-US/docs/Web/API/Range/endOffset and in contrast the docs to toRange
    if (range.endContainer.nodeType !== Node.TEXT_NODE) {
      newRange.setEnd(newRange.endContainer, range.endOffset);
    }

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

export default HtmlDomUtils;
