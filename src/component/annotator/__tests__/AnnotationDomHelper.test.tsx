import { DomHandler, DomUtils, Parser as HtmlParser } from "htmlparser2";
import AnnotationDomHelper, { AnnotationType } from "../AnnotationDomHelper";
import { DataNode, Element, Node } from "domhandler";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("AnnotationDomHelper", () => {
  const html = `
    <h1>My Heading</h1>
    <p>First paragraph.
        <span about='_:123' property='${VocabularyUtils.IS_OCCURRENCE_OF_TERM}' resource='http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29'
            typeof='${VocabularyUtils.TERM_OCCURRENCE}'>
            annotated-text
        </span>
    </p>
    after annotation span
    <span about='_:111'>not-annotation</span>
    <div about='_:117' property='${VocabularyUtils.IS_OCCURRENCE_OF_TERM}' resource='http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29'
        typeof='${VocabularyUtils.TERM_OCCURRENCE}'>
        annotated-text
    </div>
    <div about='_:118' property='${VocabularyUtils.IS_OCCURRENCE_OF_TERM}' resource='http://example.org/118' typeof='${VocabularyUtils.TERM_OCCURRENCE}'>
        annotated-text
        <span id='embedded'>with embedded element</span>
        and text after
    </div>
    after text span
    <p id='with-only-child'>
        <span about='_:119' property='${VocabularyUtils.IS_OCCURRENCE_OF_TERM}' typeof='${VocabularyUtils.TERM_OCCURRENCE}'>
            Test child <i>with another element</i>
        </span>
    </p>`;

  const options = { decodeEntities: true };
  let dom: Node[];
  let annotationSpan: Element;
  let otherSpan: Element;
  const sut = AnnotationDomHelper;
  const du = DomUtils;

  beforeEach(() => {
    const handler = new DomHandler();
    const parser = new HtmlParser(handler, options);
    parser.parseComplete(html);
    dom = handler.dom as Node[];
    annotationSpan = du.find(
      (n: Node) =>
        (n as Element).name === "span" &&
        (n as Element).attribs.about === "_:123",
      dom,
      true,
      1
    )[0] as Element;
    otherSpan = du.find(
      (n: Node) =>
        (n as Element).name === "span" && !(n as Element).attribs.property,
      dom,
      true,
      1
    )[0] as Element;
  });

  describe("isAnnotation", () => {
    it("recognizes annotation", () => {
      expect(sut.isAnnotation(otherSpan)).toBe(false);
      expect(sut.isAnnotation(annotationSpan)).toBe(true);
    });

    it("recognizes annotation in other element that span", () => {
      const node = du.find(
        (n: Node) =>
          (n as Element).name === "div" &&
          (n as Element).attribs.property !== undefined,
        dom,
        true,
        1
      )[0];
      expect(node).toBeDefined();
      expect(sut.isAnnotation(node)).toBeTruthy();
    });

    it("recognizes annotation of definition", () => {
      const annotationNode = {
        attribs: {
          typeof: AnnotationType.DEFINITION,
          property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
          children: [{ data: "Text", type: "text" }],
        },
      };
      // @ts-ignore
      expect(sut.isAnnotation(annotationNode)).toBeTruthy();
    });
  });

  it("findAnnotation finds span", () => {
    const about = (annotationSpan as Element).attribs.about;

    const foundSpan = sut.findAnnotation(dom, about);

    expect(foundSpan).toEqual(annotationSpan);
  });

  describe("removeAnnotation", () => {
    it("replaces span with text", () => {
      const spanId = "test-id";
      annotationSpan.attribs.id = spanId;
      const about = annotationSpan.attribs.about;
      const text = (annotationSpan.children![0]! as DataNode).data;

      expect(html).toContain(about);
      expect(html).toContain(text);

      sut.removeAnnotation(annotationSpan, dom);

      const newHtml = DomUtils.getOuterHTML(dom);

      expect(newHtml).not.toContain(about);
      expect(newHtml).not.toContain(spanId);
      expect(newHtml).toContain(text);
    });

    it("removes RDFa attributes from a node containing multiple children", () => {
      const toRemove = du.find(
        (n: Node) =>
          (n as Element).name === "div" &&
          (n as Element).attribs.resource === "http://example.org/118",
        dom,
        true,
        1
      )[0];
      expect(toRemove).toBeDefined();
      const about = (toRemove as Element).attribs!.about;
      expect(html).toContain(about);

      sut.removeAnnotation(toRemove, dom);
      const newHtml = DomUtils.getOuterHTML(dom);
      expect(newHtml).not.toContain(about);
      expect(
        du.find(
          (n: Node) =>
            (n as Element).name === "span" &&
            (n as Element).attribs.id === "embedded",
          dom,
          true,
          1
        ).length
      ).toBeGreaterThan(0);
    });

    // Bug #1358
    it("replaces annotation node in list of DOM nodes with text node when it is a top-level node", () => {
      const topLevelAnnotation = du.find(
        (n: Node) =>
          (n as Element).name === "div" &&
          (n as Element).attribs.about === "_:117",
        dom,
        true,
        1
      )[0] as Element;
      const originalLength = dom.length;
      const annotationIndex = dom.indexOf(topLevelAnnotation);
      expect(annotationIndex).not.toEqual(-1);
      sut.removeAnnotation(topLevelAnnotation, dom);
      expect(dom.indexOf(topLevelAnnotation)).toEqual(-1);
      expect(dom.length).toEqual(originalLength);
      expect((dom[annotationIndex] as DataNode).data.trim()).toEqual(
        "annotated-text"
      );
    });

    it("replaces annotation node with its children when it is the only child of its parent", () => {
      const toRemove = du.find(
        (n: Node) =>
          (n as Element).name === "span" &&
          (n as Element).attribs.about === "_:119",
        dom,
        true,
        1
      )[0];
      expect(toRemove).toBeDefined();
      const about = (toRemove as Element).attribs!.about;
      expect(html).toContain(about);
      sut.removeAnnotation(toRemove, dom);
      const newHtml = DomUtils.getOuterHTML(dom);
      expect(newHtml).not.toContain(about);
      const paragraph = du.find(
        (n: Node) =>
          (n as Element).name === "p" &&
          (n as Element).attribs.id === "with-only-child",
        dom,
        true,
        1
      )[0] as Element;
      expect(paragraph).toBeDefined();
      expect(
        paragraph.children.find(
          (c) => (c as any).attribs && (c as any).attribs.about === "_:119"
        )
      ).not.toBeDefined();
      expect(paragraph.children.length).toEqual(3);
    });
  });

  it("isAnnotationWithMinimumScore returns false if score is less-than threshold", () => {
    annotationSpan.attribs.score = "0.4";
    expect(sut.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(false);
  });

  it("isAnnotationWithMinimumScore returns true if score is more-than or equal threshold", () => {
    annotationSpan.attribs.score = "0.5";
    expect(sut.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(true);
    expect(sut.isAnnotationWithMinimumScore(annotationSpan, 0.4)).toBe(true);
  });

  it("isAnnotationWithMinimumScore returns true if score is not defined", () => {
    expect(sut.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(true);
  });

  describe("createNewAnnotation", () => {
    let htmlDoc: Document;

    beforeEach(() => {
      htmlDoc = new DOMParser().parseFromString(html, "text/html");
    });

    it("wraps text node in an annotation span", () => {
      const about = "_:1";
      const textNodes = htmlDoc.body.children[2].childNodes;
      const result = sut.createNewAnnotation(about, textNodes);
      expect(result).toBeDefined();
      expect(result.name).toEqual("span");
      expect(result.attribs.about).toEqual(about);
      expect(result.children).toBeDefined();
      expect(result.children!.length).toEqual(textNodes.length);
      expect((result.children![0] as DataNode).data).toEqual(
        htmlDoc.body.children[2].textContent
      );
    });

    it("wraps text nodes containing a span in an annotation span", () => {
      const about = "_:1";
      const testHtml =
        "<html lang='en'><body><div>text before, <span>in</span> and after span</div></body></html>";
      htmlDoc = new DOMParser().parseFromString(testHtml, "text/html");
      const textNodes = htmlDoc.body.children[0].childNodes;
      const result = sut.createNewAnnotation(about, textNodes);
      expect(result).toBeDefined();
      expect(result.name).toEqual("span");
      expect(result.attribs.about).toEqual(about);
      expect(result.children).toBeDefined();
      expect((result.children![0] as DataNode).data).toEqual(
        textNodes.item(0).textContent
      );
      expect((result.children![1] as Element).name).toEqual(
        textNodes.item(1).nodeName.toLowerCase()
      );
      expect((result.children![2] as DataNode).data).toEqual(
        textNodes.item(2).textContent
      );
    });

    it("wraps div with text in an annotation div", () => {
      const about = "_:1";
      const testHtml =
        "<html lang='en'><body><div>text before, <span>in</span> and after span</div></body></html>";
      htmlDoc = new DOMParser().parseFromString(testHtml, "text/html");
      const textNodes = htmlDoc.body.childNodes;
      const result = sut.createNewAnnotation(about, textNodes);
      expect(result).toBeDefined();
      expect(result.name).toEqual("div");
      expect(result.attribs.about).toEqual(about);
      expect(result.children).toBeDefined();
      expect((result.children![0] as Element).name).toEqual(
        textNodes.item(0).nodeName.toLowerCase()
      );
    });

    it("creates annotation with definition property when type is specified as definition", () => {
      const about = "_:1";
      const textNodes = htmlDoc.body.children[3].childNodes;
      const result = sut.createNewAnnotation(
        about,
        textNodes,
        AnnotationType.DEFINITION
      );
      expect(result).toBeDefined();
      expect(result.name).toEqual("span");
      expect(result.attribs.typeof).toEqual(AnnotationType.DEFINITION);
      expect(result.attribs.property).toEqual(
        VocabularyUtils.IS_DEFINITION_OF_TERM
      );
    });
  });

  describe("generateSelector", () => {
    it("creates TextQuoteSelector from text content of the specified node", () => {
      const selector = sut.generateSelector(annotationSpan);
      expect(selector).toBeDefined();
      expect(selector.exactMatch).toEqual(
        (annotationSpan.children![0] as DataNode).data
      );
    });
  });
});
