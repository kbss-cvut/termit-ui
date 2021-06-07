import {DomUtils} from "htmlparser2";
import {DataNode, Element as DomHandlerElement, Node as DomHandlerNode, NodeWithChildren} from "domhandler";
import VocabularyUtils from "../../util/VocabularyUtils";
import HtmlParserUtils from "./HtmlParserUtils";
import HtmlDomUtils from "./HtmlDomUtils";
import {TextQuoteSelector} from "../../model/TermOccurrence";
import Utils from "../../util/Utils";

export const AnnotationType = {
  OCCURRENCE: VocabularyUtils.TERM_OCCURRENCE,
  DEFINITION: VocabularyUtils.DEFINITION,
};

function toHtmlString(nodeList: NodeList): string {
  let result = "";
  for (let i = 0; i < nodeList.length; i++) {
    const item = nodeList.item(i)!;
    if (item.nodeType === Node.ELEMENT_NODE) {
      result += (item as Element).outerHTML;
    } else {
      result += item.textContent;
    }
  }
  return result;
}

function getPropertyForAnnotationType(annotationType: string) {
  if (annotationType === AnnotationType.DEFINITION) {
    return VocabularyUtils.IS_DEFINITION_OF_TERM;
  }
  return VocabularyUtils.IS_OCCURRENCE_OF_TERM;
}

const AnnotationDomHelper = {
  isAnnotation(node: DomHandlerNode, prefixMap?: Map<string, string>): boolean {
    if (!node || !(node as DomHandlerElement).attribs) {
      return false;
    }
    const type = HtmlParserUtils.resolveIri(
      (node as DomHandlerElement).attribs.typeof,
      prefixMap
    );
    return (
      type === AnnotationType.OCCURRENCE || type === AnnotationType.DEFINITION
    );
  },

  findAnnotation(
    dom: DomHandlerNode[],
    annotationId: string,
    prefixMap?: Map<string, string>
  ): DomHandlerElement | void {
    const foundResults = DomUtils.find(
      (n: DomHandlerNode) =>
        this.isAnnotation(n, prefixMap) &&
        annotationId === (n as DomHandlerElement).attribs.about,
      dom,
      true,
      1
    );
    if (foundResults && foundResults.length === 1) {
      return foundResults[0] as DomHandlerElement;
    }
  },

  removeAnnotation(annotation: DomHandlerNode, dom: DomHandlerNode[]): void {
    // assuming annotation.type === "tag"
    const elem = annotation as DomHandlerElement;
    if (
      Utils.sanitizeArray(elem.children).length === 1 &&
      elem.children![0].type === "text"
    ) {
      const newNode = this.createTextualNode(elem);
      DomUtils.replaceElement(elem, newNode);
      const elemInd = dom.indexOf(elem);
      if (elemInd !== -1) {
        dom.splice(elemInd, 1, newNode);
      }
    } else if (this.isOnlyChild(annotation)) {
      const parent = annotation.parentNode! as DomHandlerElement;
      // Create a copy to prevent issues with iteration when children are being moved around
      const copy = elem.childNodes.slice();
      for (let cn of copy) {
          DomUtils.appendChild(parent, cn)
      }
      parent.children.splice(0, 1);
    } else {
      // If the node is not just text, it contains other elements as well. In that case, just delete the
      // RDFa-specific attributes
      delete elem.attribs.about;
      delete elem.attribs.resource;
      delete elem.attribs.property;
      delete elem.attribs.typeof;
      delete elem.attribs.class;
    }
  },

  isOnlyChild(annotation: DomHandlerNode) {
    return annotation.parent && !annotation.previousSibling && !annotation.nextSibling;
  },

  createTextualNode(annotation: NodeWithChildren): any {
    return {
      data: (annotation.children![0] as DataNode).data,
      type: "text",
    };
  },

  replaceAnnotation(
    oldAnnotation: DomHandlerNode,
    newAnnotation: DomHandlerNode
  ): void {
    DomUtils.replaceElement(oldAnnotation, newAnnotation);
  },

  createNewAnnotation(
    about: string,
    nodeList: NodeList,
    type: string = AnnotationType.OCCURRENCE,
    prefixMap?: Map<string, string>
  ): DomHandlerElement {
    const newDom = HtmlParserUtils.html2dom(toHtmlString(nodeList));
    const tagName = HtmlDomUtils.containsBlockElement(nodeList)
      ? "div"
      : "span";
    const elem = new DomHandlerElement(tagName, {
      about,
      property: HtmlParserUtils.shortenIri(
        getPropertyForAnnotationType(type),
        prefixMap
      ),
      typeof: HtmlParserUtils.shortenIri(type, prefixMap),
    });
    elem.children = newDom;
    return elem;
  },

  isAnnotationWithMinimumScore(
    node: DomHandlerElement,
    score: number
  ): boolean {
    // assert this.isAnnotation(node, prefixMap)
    if (!node.attribs.score) {
      return true;
    }
    return score <= Number(node.attribs.score);
  },

  generateSelector(node: DomHandlerNode): TextQuoteSelector {
    return {
      exactMatch: HtmlDomUtils.getTextContent(node),
      types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
    };
  },
};

export default AnnotationDomHelper;
