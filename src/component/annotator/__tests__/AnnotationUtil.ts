import { AnnotationSpanProps } from "../Annotator";
import { ReactElement } from "react";
import { MountRendererProps } from "enzyme";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

export function surroundWithHtml(partialHtmlContent: string): string {
  return (
    '<html prefix="ddo: http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/">\n' +
    "<head><title>Test document</title></head>\n" +
    "<body>\n" +
    partialHtmlContent +
    "</body>\n" +
    "</html>\n"
  );
}

export function createAnnotation(
  props: AnnotationSpanProps,
  text: string,
  element: string = "span"
) {
  return `<${element} ${Object.keys(props)
    .reduce((a, k) => k + "=" + props[k] + " " + a, " ")
    .trim()}>${text}</${element}>`;
}

/**
 * Same as mountWithIntl function but attaches node component to a newly created div node so functions that access
 * document can access it.
 *
 * This is particularly usefull for reactstrap Popover component due to issue
 * "https://github.com/reactstrap/reactstrap/issues/773", which is often manifested by message
 * "The target '$id' could not be identified in the dom, tip: check spelling"
 *
 * @param node The element to render
 * @param options Optional rendering options for Enzyme
 */

export function mountWithIntlAttached(
  node: ReactElement<any>,
  options?: MountRendererProps
) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return mountWithIntl(node, Object.assign({}, { attachTo: div }, options));
}
