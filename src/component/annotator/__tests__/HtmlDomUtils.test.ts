// @ts-ignore
import {fromRange, toRange, XPathRange} from "xpath-range";
import HtmlDomUtils from "../HtmlDomUtils";
import {mockWindowSelection} from "../../../__tests__/environment/Environment";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {TextQuoteSelector} from "../../../model/TermOccurrence";
import Generator from "../../../__tests__/environment/Generator";
import {NodeWithChildren, Text as DomHandlerText} from "domhandler";
import {ElementType} from "domelementtype";

jest.mock("xpath-range", () => ({
  fromRange: jest.fn(),
  toRange: jest.fn(),
}));

describe("Html dom utils", () => {
  const htmlContent =
    "<html lang='en'><head><title>Test</title></head><body/></html>";
  const sampleDivContent =
    "before div<div>before span<span>sample text pointer in span</span>after span</div>after div";
  const surroundingElementHtml = "<span>text pointer</span>";
  const xpathTextPointerRange: XPathRange = {
    start: "/div[1]/span[1]/text()[1]",
    end: "/div[1]/span[1]/text()[1]",
    startOffset: 7,
    endOffset: 19,
  };
  let sampleDiv: HTMLDivElement;
  let doc: Document;
  let sampleTextNode: Text;
  let getRangeAt: (i: number) => any;
  let cloneContents: () => DocumentFragment;
  let textPointerRange: any;
  beforeEach(() => {
    // // @ts-ignore
    window.getSelection = jest.fn().mockImplementation(() => {
      return {
        isCollapsed: true,
        rangeCount: 1,
      };
    });
    cloneContents = jest.fn().mockImplementation(() => {
      return { childNodes: [sampleTextNode] };
    });
    getRangeAt = jest.fn().mockImplementation(() => {
      return { cloneContents };
    });
    textPointerRange = {
      extractContents: jest.fn(),
      surroundContents: jest.fn(),
      insertNode: jest.fn(),
      setEnd: jest.fn(),
      setStart: jest.fn()
    };

    const parser = new DOMParser();
    doc = parser.parseFromString(htmlContent, "text/html");
    sampleDiv = doc.createElement("div");
    sampleDiv.innerHTML = sampleDivContent;
    sampleTextNode = doc.createTextNode("text pointer");
    doc.body.appendChild(sampleDiv);
  });

  describe("hasSelection", () => {
    it("returns true for a valid selection range", () => {
      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt,
      });
      expect(HtmlDomUtils.hasSelection()).toBeTruthy();
    });

    it("returns false for collapsed selection", () => {
      mockWindowSelection({
        isCollapsed: true,
        rangeCount: 1,
        getRangeAt,
      });
      expect(HtmlDomUtils.hasSelection()).toBeFalsy();
    });
  });

  describe("get selection range", () => {
    it("returns range for a text node", () => {
      let ret: Range | null;

      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt,
      });
      ret = HtmlDomUtils.getSelectionRange();
      expect(window.getSelection).toHaveBeenCalled();
      expect(getRangeAt).toHaveBeenCalledWith(0);
      expect(ret).not.toBeNull();
      expect(ret!.cloneContents).toEqual(cloneContents);
    });

    it("returns null if nothing is selected", () => {
      let ret: Range | null;

      mockWindowSelection({ isCollapsed: true });
      ret = HtmlDomUtils.getSelectionRange();
      expect(window.getSelection).toHaveBeenCalledTimes(1);
      expect(ret).toEqual(null);

      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 0,
        getRangeAt: () => null,
      });
      ret = HtmlDomUtils.getSelectionRange();
      expect(window.getSelection).toHaveBeenCalledTimes(1);
      expect(ret).toEqual(null);
    });
  });

  describe("replace range", () => {
    it("returns clone of input element", () => {
      let ret: HTMLElement | null;
      (fromRange as jest.Mock).mockImplementation(() => {
        return xpathTextPointerRange;
      });

      (toRange as jest.Mock).mockImplementation(() => {
        return textPointerRange;
      });
      textPointerRange.endContainer = {
        nodeType: Node.TEXT_NODE
      }
      ret = HtmlDomUtils.replaceRange(
        sampleDiv,
        textPointerRange,
        surroundingElementHtml
      );
      expect(fromRange).toHaveBeenCalledWith(expect.any(Object), sampleDiv);
      expect(toRange).toHaveBeenCalledWith(
        xpathTextPointerRange.start,
        xpathTextPointerRange.startOffset,
        xpathTextPointerRange.end,
        xpathTextPointerRange.endOffset,
        expect.any(Object)
      );
      expect(ret).not.toBe(sampleDiv);
      expect(ret.children[0].childNodes[0].nodeValue).toEqual(
        sampleDiv.children[0].childNodes[0].nodeValue
      );
    });

    // Bug #1564
    it("uses original range end offset to work around offsetting issues when range end container is not a text node", () => {
      (fromRange as jest.Mock).mockImplementation(() => {
        return xpathTextPointerRange;
      });

      (toRange as jest.Mock).mockImplementation(() => {
        return textPointerRange;
      });
      const originalRange: any = {
        endContainer: {
          nodeType: Node.ELEMENT_NODE
        },
        endOffset: 10
      };
      HtmlDomUtils.replaceRange(
          sampleDiv,
          originalRange,
          surroundingElementHtml
      );
      expect(textPointerRange.setEnd).toHaveBeenCalledWith(textPointerRange.endContainer, originalRange.endOffset);
    });
  });

  describe("doesRangeSpanMultipleElements", () => {
    it("returns false for simple range in text", () => {
      const range: any = {
        startContainer: doc.body.children[0].children[0].childNodes[0],
        startOffset: 2,
        endContainer: doc.body.children[0].children[0].childNodes[0],
        endOffset: 10,
        commonAncestorContainer: doc.body.children[0].children[0],
      };
      expect(
        HtmlDomUtils.doesRangeSpanMultipleElements(range as Range)
      ).toBeFalsy();
    });

    it("returns false for range containing an element", () => {
      const range: any = {
        startContainer: doc.body.children[0].children[0].childNodes[0],
        startOffset: 2,
        endContainer: doc.body.children[0].children[0].childNodes[2],
        endOffset: 3,
        commonAncestorContainer: doc.body.children[0].children[0],
      };
      expect(
        HtmlDomUtils.doesRangeSpanMultipleElements(range as Range)
      ).toBeFalsy();
    });

    it("returns true for range spanning two elements", () => {
      const range: any = {
        startContainer:
          doc.body.children[0].children[0].childNodes[1].firstChild,
        startOffset: 2,
        endContainer: doc.body.children[0].children[0].childNodes[2],
        endOffset: 3,
        commonAncestorContainer: doc.body.children[0].children[0],
      };
      expect(
        HtmlDomUtils.doesRangeSpanMultipleElements(range as Range)
      ).toBeTruthy();
    });
  });

  describe("containsBlockElement", () => {
    it("returns false for simple range in text", () => {
      expect(
        HtmlDomUtils.containsBlockElement(
          doc.body.children[0].children[0].childNodes[0].childNodes
        )
      ).toBeFalsy();
    });

    it("returns false for range containing a span", () => {
      expect(
        HtmlDomUtils.containsBlockElement(
          doc.body.children[0].children[0].childNodes
        )
      ).toBeFalsy();
    });

    it("returns true for range containing a div", () => {
      expect(
        HtmlDomUtils.containsBlockElement(doc.body.children[0].childNodes)
      ).toBeTruthy();
    });
  });

  describe("getTextContent", () => {
    it("returns data from a single text node", () => {
      const text = "aaaa";
      const node = new DomHandlerText(text);
      const result = HtmlDomUtils.getTextContent(node);
      expect(result).toEqual(text);
    });

    it("returns data from multiple text nodes", () => {
      const textOne = "aaaa";
      const textTwo = "bbbb";
      const nodeOne = new DomHandlerText(textOne);
      const nodeTwo = new DomHandlerText(textTwo);
      const result = HtmlDomUtils.getTextContent([nodeOne, nodeTwo]);
      expect(result).toEqual(textOne + textTwo);
    });

    it("recursively retrieves children text data from element nodes", () => {
      const textOne = "aaaa";
      const textTwo = "bbbb";
      const nodeOne = new DomHandlerText(textOne);
      const nodeTwo = new NodeWithChildren(ElementType.Tag, [new DomHandlerText(textTwo)]);
      const result = HtmlDomUtils.getTextContent([nodeOne, nodeTwo]);
      expect(result).toEqual(textOne + textTwo);
    });
  });

  describe("findAnnotationElementBySelector", () => {
    const html =
      "<html lang='en'><head><title>Test</title></head><body><div id='annotator'>" +
      "text before" +
      '<span about="_:123" property="' +
      VocabularyUtils.IS_OCCURRENCE_OF_TERM +
      '"\n' +
      '                  resource="https://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29"\n' +
      '                  typeof="' +
      VocabularyUtils.TERM_OCCURRENCE +
      '">annotated-text</span>' +
      "\n after annotation span" +
      '            <span about="_:111" \n>not-annotation</span>' +
      "            <div about='_:117' property=\"" +
      VocabularyUtils.IS_DEFINITION_OF_TERM +
      '"\n' +
      '                  resource="https://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29"\n' +
      '                  typeof="' +
      VocabularyUtils.DEFINITION +
      '">definition-text separated by spaces</div>text after' +
      "</div></body></html>";

    beforeEach(() => {
      const parser = new DOMParser();
      doc = parser.parseFromString(html, "text/html");
    });

    it("finds unique term occurrence span", () => {
      const selector: TextQuoteSelector = {
        exactMatch: "annotated-text",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      };
      const result = HtmlDomUtils.findAnnotationElementBySelector(
        doc,
        selector
      );
      expect(result).toBeDefined();
      expect(result.getAttribute("about")).toEqual("_:123");
    });

    it("finds unique term definition div", () => {
      const selector: TextQuoteSelector = {
        exactMatch: "definition-text separated by spaces",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      };
      const result = HtmlDomUtils.findAnnotationElementBySelector(
        doc,
        selector
      );
      expect(result).toBeDefined();
      expect(result.getAttribute("about")).toEqual("_:117");
    });

    it("finds term occurrence among multiple with same text using prefix and suffix", () => {
      const alternativeAnnotation = doc.createElement("div");
      alternativeAnnotation.textContent = "annotated-text";
      alternativeAnnotation.setAttribute("about", "_:586");
      alternativeAnnotation.setAttribute(
        "typeof",
        VocabularyUtils.TERM_OCCURRENCE
      );
      alternativeAnnotation.setAttribute("resource", Generator.generateUri());
      alternativeAnnotation.setAttribute(
        "property",
        VocabularyUtils.IS_OCCURRENCE_OF_TERM
      );
      doc.getElementById("annotator")!.appendChild(alternativeAnnotation);
      const selector: TextQuoteSelector = {
        exactMatch: "annotated-text",
        prefix: "text before",
        suffix: "\n after annotation span",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      };

      const result = HtmlDomUtils.findAnnotationElementBySelector(
        doc,
        selector
      );
      expect(result).toBeDefined();
      expect(result.getAttribute("about")).toEqual("_:123");
    });

    it("throws error when matching element is not found", () => {
      const selector: TextQuoteSelector = {
        exactMatch: "unknown-text",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      };
      expect(() =>
        HtmlDomUtils.findAnnotationElementBySelector(doc, selector)
      ).toThrowError(
        new Error(
          `Element with exact match '${selector.exactMatch}' not found in document.`
        )
      );
    });

    it("finds definition with loose space-less match in case no other match exists", () => {
      const selector: TextQuoteSelector = {
        exactMatch: "definition-text separatedby spaces",
        types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
      };
      const result = HtmlDomUtils.findAnnotationElementBySelector(
        doc,
        selector
      );
      expect(result).toBeDefined();
      expect(result.getAttribute("about")).toEqual("_:117");
    });
  });
});
