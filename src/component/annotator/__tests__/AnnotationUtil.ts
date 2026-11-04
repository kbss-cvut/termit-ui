import { AnnotationSpanProps } from "../Annotator";

export function surroundWithHtml(partialHtmlContent: string): string {
  return (
    '<html lang="en" prefix="termit: http://onto.fel.cvut.cz/ontologies/application/termit/">\n' +
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
