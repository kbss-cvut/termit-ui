import { DomHandler, Parser as HtmlParser } from "htmlparser2";
import { Element, Node } from "domhandler";
import render from "dom-serializer";

const RDF_ATTRIBUTE_NAMES = ["about", "property", "resource", "typeof"];

function removeAddedAttributes(elem: Element) {
  // Restore links to their original state - see AnnotatorContent.PREPROCESSING_INSTRUCTIONS
  if (elem.tagName === "a") {
    if (elem.attribs["data-href"]) {
      elem.attribs.href = elem.attribs["data-href"];
      delete elem.attribs["data-href"];
    }
    delete elem.attribs["target"];
    delete elem.attribs["rel"];
    if (elem.attribs["data-rel"]) {
      elem.attribs.rel = elem.attribs["data-rel"];
      delete elem.attribs["data-rel"];
    }
    if (elem.attribs["data-target"]) {
      elem.attribs.target = elem.attribs["data-target"];
      delete elem.attribs["data-target"];
    }
  }
}

const HtmlParserUtils = {
  html2dom(html: string): Node[] {
    // Do not decode HTML entities (e.g., &lt;) when parsing content for object representation, it caused issues
    // with rendering
    const options = { decodeEntities: false };
    // @ts-ignore
    const handler = new DomHandler(null, null, removeAddedAttributes);
    const parser = new HtmlParser(handler, options);
    parser.parseComplete(html);
    return handler.dom as Node[];
  },

  dom2html(dom: Node[]): string {
    return render(dom, { decodeEntities: false });
  },
  /**
   * Returns prefix map defined in attribute 'prefix' of an html node.
   * The attribute may contain set of prefix definitions separated by white-space,
   * where each prefix definition has form:
   * NCName ':' ' '+ xsd:anyURI
   * @param node Html node.
   */
  getPrefixMap(node: Node): Map<string, string> {
    if ((node as Element).attribs && (node as Element).attribs.prefix) {
      const words = (node as Element).attribs.prefix.split(/\s+/);
      if (words.length % 2) {
        throw new Error(
          "Failed to parse prefix '" +
            (node as Element).attribs.prefix +
            "' defined within tag " +
            (node as Element).name +
            ". Length of tokens separated by white-space is not even."
        );
      }
      const map = new Map();
      for (let i = 0; i < words.length; i = i + 2) {
        if (!words[i].endsWith(":")) {
          throw new Error(
            "Failed to parse prefix '" +
              (node as Element).attribs.prefix +
              "' defined within tag " +
              (node as Element).name +
              ". Token " +
              words[i] +
              " does not end with ':'."
          );
        }
        const prefix = words[i].substring(0, words[i].length - 1);
        map.set(prefix, words[i + 1]);
      }
      return map;
    }
    return new Map();
  },
  resolveIri(iri: string, prefixMap?: Map<string, string>) {
    if (prefixMap && iri) {
      const tokens = iri.split(":");
      if (tokens.length === 2) {
        const prefixValue = prefixMap.get(tokens[0]);
        if (prefixValue) {
          return prefixValue + tokens[1];
        }
      }
    }
    return iri;
  },
  shortenIri(iri: string, prefixMap?: Map<string, string>) {
    if (prefixMap) {
      const fragmentIndex = iri.search(/[^/#]*$/);
      if (fragmentIndex !== -1) {
        const namespace = iri.slice(0, fragmentIndex);
        for (const [k, v] of Array.from(prefixMap)) {
          if (namespace === v) {
            return k + ":" + iri.slice(fragmentIndex);
          }
        }
      }
    }
    return iri;
  },
  /**
   * Return new set of html node attributes with resolved properties that are related to RDFa.
   * @param attrs Attributes of html node.
   * @param prefixMap Mapping of rdf prefixes to its relevant namespaces.
   * @return Copy of attrs with resolved rdf properties.
   */
  resolveRDFAttributes(attrs: any, prefixMap?: Map<string, string>): any {
    const newAttrs = { ...attrs };

    for (const name of RDF_ATTRIBUTE_NAMES) {
      if (attrs[name]) {
        newAttrs[name] = this.resolveIri(attrs[name], prefixMap);
      }
    }
    return newAttrs;
  },
};

export default HtmlParserUtils;
