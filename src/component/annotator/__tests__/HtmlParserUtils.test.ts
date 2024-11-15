import { Element } from "domhandler";
import HtmlParserUtils from "../HtmlParserUtils";

describe("HtmlParserUtils", () => {
  describe("html2dom", () => {
    it("remove target and rel attributes added when rendering HTML", () => {
      const html =
        '<a href="http://example.com" target="_blank" rel="noopener noreferrer">Example</a>';
      const nodes = HtmlParserUtils.html2dom(html);
      expect((nodes[0] as Element).attribs.href).toEqual("http://example.com");
      expect((nodes[0] as Element).attribs.target).not.toBeDefined();
      expect((nodes[0] as Element).attribs.rel).not.toBeDefined();
    });

    it("set href attribute to data-href attribute created when rendering HTML", () => {
      const html = '<a data-href="./about.html">Example</a>';
      const nodes = HtmlParserUtils.html2dom(html);
      expect((nodes[0] as Element).attribs.href).toEqual("./about.html");
      expect((nodes[0] as Element).attribs["data-href"]).not.toBeDefined();
    });
  });
});
