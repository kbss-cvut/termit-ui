// @ts-ignore
import {DomHandler, DomUtils, Parser as HtmlParser} from "htmlparser2";
import AnnotationDomHelper, {AnnotationType} from "../AnnotationDomHelper";
// @ts-ignore
import {Node} from "html-to-react";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("AnnotationDomHelper", () => {

    const html = "<html lang='en'>\n" +
        "<body>\n" +
        "\n" +
        "      <h1>My Heading</h1>\n" +
        "\n" +
        "            <p>First paragraph.</p>\n" +
        "            <span about=\"_:123\" property=\"" + VocabularyUtils.IS_OCCURRENCE_OF_TERM + "\"\n" +
        "                  resource=\"http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29\"\n" +
        "                  typeof=\"" + VocabularyUtils.TERM_OCCURRENCE + "\">annotated-text</span>" +
        "\n after annotation span" +
        "            <span about=\"_:111\" \n>not-annotation</span>" +
        "            <div about='_:117' property=\"" + VocabularyUtils.IS_OCCURRENCE_OF_TERM + "\"\n" +
        "                  resource=\"http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/modernisticka-struktura-%28zastavba%29\"\n" +
        "                  typeof=\"" + VocabularyUtils.TERM_OCCURRENCE + "\">annotated-text</div>" +
        "            <div about='_:118' property=\"" + VocabularyUtils.IS_OCCURRENCE_OF_TERM + "\"\n" +
        "                  resource=\"http://example.org/118\"\n" +
        "                  typeof=\"" + VocabularyUtils.TERM_OCCURRENCE + "\">annotated-text<span id='embedded'>with embedded element</span>and text after</div>" +
        "\n after text span" +
        "</body>\n" +
        "</html>";
    const options = {decodeEntities: true};
    let dom: [Node];
    let annotationSpan: Node;
    let otherSpan: Node;
    const ah = AnnotationDomHelper;
    const du = DomUtils;

    beforeEach(() => {
        const handler = new DomHandler();
        const parser = new HtmlParser(handler, options);
        parser.parseComplete(html);
        dom = handler.dom;
        annotationSpan = du.find((n: Node) => n.name === "span" && n.attribs.property, dom, true, 1)[0];
        otherSpan = du.find((n: Node) => n.name === "span" && !n.attribs.property, dom, true, 1)[0];
    });

    describe("isAnnotation", () => {
        it("recognizes annotation", () => {
            expect(ah.isAnnotation(otherSpan)).toBe(false);
            expect(ah.isAnnotation(annotationSpan)).toBe(true);
        });

        it("recognizes annotation in other element that span", () => {
            const node = du.find((n: Node) => n.name === "div" && n.attribs.property, dom, true, 1)[0];
            expect(node).toBeDefined();
            expect(ah.isAnnotation(node)).toBeTruthy();
        });

        it("recognizes annotation of definition", () => {
            const annotationNode = {
                attribs: {
                    typeof: AnnotationType.DEFINITION,
                    property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                    children: [{data: "Text", type: "text"}]
                }
            };
            expect(ah.isAnnotation(annotationNode)).toBeTruthy();
        });
    });

    it("findAnnotation finds span", () => {
        const about = annotationSpan.attribs.about;

        const foundSpan = ah.findAnnotation(dom, about);

        expect(foundSpan).toEqual(annotationSpan);
    });

    describe("removeAnnotation", () => {
        it("replaces span with text", () => {
            const spanId = "test-id";
            annotationSpan.attribs.id = spanId;
            const about = annotationSpan.attribs.about;
            const text = annotationSpan.children![0]!.data;

            expect(html).toContain(about);
            expect(html).toContain(text);

            ah.removeAnnotation(annotationSpan);

            const newHtml = DomUtils.getOuterHTML(dom);

            expect(newHtml).not.toContain(about);
            expect(newHtml).not.toContain(spanId);
            expect(newHtml).toContain(text);
        });

        it("removes RDFa attributes from a node containing multiple children", () => {
            const toRemove = du.find((n: Node) => n.name === "div" && n.attribs.resource === "http://example.org/118", dom, true, 1)[0];
            expect(toRemove).toBeDefined();
            const about = toRemove.attribs!.about;
            expect(html).toContain(about);

            ah.removeAnnotation(toRemove);
            const newHtml = DomUtils.getOuterHTML(dom);
            expect(newHtml).not.toContain(about);
            expect(du.find((n: Node) => n.name === "span" && n.attribs.id === "embedded", dom, true, 1).length).toBeGreaterThan(0);
        });
    });

    it("isAnnotationWithMinimumScore returns false if score is less-than threshold", () => {
        annotationSpan.attribs.score = "0.4";
        expect(ah.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(false);
    });

    it("isAnnotationWithMinimumScore returns true if score is more-than or equal threshold", () => {
        annotationSpan.attribs.score = "0.5";
        expect(ah.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(true);
        expect(ah.isAnnotationWithMinimumScore(annotationSpan, 0.4)).toBe(true);
    });

    it("isAnnotationWithMinimumScore returns true if score is not defined", () => {
        expect(ah.isAnnotationWithMinimumScore(annotationSpan, 0.5)).toBe(true);
    });

    describe("createNewAnnotation", () => {

        let htmlDoc: Document;

        beforeEach(() => {
            htmlDoc = new DOMParser().parseFromString(html, "text/html");
        });

        it("wraps text node in an annotation span", () => {
            const about = "_:1";
            const textNodes = htmlDoc.body.children[3].childNodes;
            const result = ah.createNewAnnotation(about, textNodes);
            expect(result).toBeDefined();
            expect(result.name).toEqual("span");
            expect(result.attribs.about).toEqual(about);
            expect(result.children).toBeDefined();
            expect(result.children!.length).toEqual(textNodes.length);
            expect(result.children![0].data).toEqual(htmlDoc.body.children[3].textContent);
        });

        it("wraps text nodes containing a span in an annotation span", () => {
            const about = "_:1";
            const testHtml = "<html lang='en'><body><div>text before, <span>in</span> and after span</div></body></html>";
            htmlDoc = new DOMParser().parseFromString(testHtml, "text/html");
            const textNodes = htmlDoc.body.children[0].childNodes;
            const result = ah.createNewAnnotation(about, textNodes);
            expect(result).toBeDefined();
            expect(result.name).toEqual("span");
            expect(result.attribs.about).toEqual(about);
            expect(result.children).toBeDefined();
            expect(result.children![0].data).toEqual(textNodes.item(0).textContent);
            expect(result.children![1].name).toEqual(textNodes.item(1).nodeName.toLowerCase());
            expect(result.children![2].data).toEqual(textNodes.item(2).textContent);
        });

        it("wraps div with text in an annotation div", () => {
            const about = "_:1";
            const testHtml = "<html lang='en'><body><div>text before, <span>in</span> and after span</div></body></html>";
            htmlDoc = new DOMParser().parseFromString(testHtml, "text/html");
            const textNodes = htmlDoc.body.childNodes;
            const result = ah.createNewAnnotation(about, textNodes);
            expect(result).toBeDefined();
            expect(result.name).toEqual("div");
            expect(result.attribs.about).toEqual(about);
            expect(result.children).toBeDefined();
            expect(result.children![0].name).toEqual(textNodes.item(0).nodeName.toLowerCase());
        });

        it("creates annotation with definition property when type is specified as definition", () => {
            const about = "_:1";
            const textNodes = htmlDoc.body.children[3].childNodes;
            const result = ah.createNewAnnotation(about, textNodes, AnnotationType.DEFINITION);
            expect(result).toBeDefined();
            expect(result.name).toEqual("span");
            expect(result.attribs.typeof).toEqual(AnnotationType.DEFINITION);
            expect(result.attribs.property).toEqual(VocabularyUtils.IS_DEFINITION_OF_TERM);
        });
    });

    describe("generateSelector", () => {
        it("creates TextQuoteSelector from text content of the specified node", () => {
            const selector = ah.generateSelector(annotationSpan);
            expect(selector).toBeDefined();
            expect(selector.exactMatch).toEqual((annotationSpan.children![0]).data);
        });
    });
});
