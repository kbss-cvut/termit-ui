import * as React from "react";
import Term, { TermData } from "../../model/Term";
import { AnnotationSpanProps } from "./Annotator";
import {
  Parser as HtmlToReactParser,
  ProcessNodeDefinitions,
} from "html-to-react";
import {
  Element as DomHandlerElement,
  Node as DomHandlerNode,
} from "domhandler";
import AnnotationDomHelper from "./AnnotationDomHelper";
import HtmlParserUtils from "./HtmlParserUtils";
import Annotation from "./Annotation";
import HtmlDomUtils from "./HtmlDomUtils";
import Utils from "../../util/Utils";
import AccessLevel from "../../model/acl/AccessLevel";

interface AnnotatorContentProps {
  prefixMap: Map<string, string>;
  stickyAnnotationId: string;
  content: DomHandlerNode[];
  accessLevel: AccessLevel; // The level of access rights the current user has
  highlightedTerm: TermData | null;

  onRemove: (annotationId: string | string[]) => void;
  onUpdate: (annotationSpan: AnnotationSpanProps, term: Term | null) => void;
  onResetSticky: () => void;
  onCreateTerm: (label: string, annotation: AnnotationSpanProps) => void;
}

const ANNOTATION_MINIMUM_SCORE_THRESHOLD = 0.65;
const PREPROCESSING_INSTRUCTIONS = [
  {
    shouldPreprocessNode: (node: any): boolean =>
      node.name && node.name === "a",
    preprocessNode: (node: any) => {
      node.attribs["data-href"] = node.attribs.href;
      delete node.attribs.href;
    },
  },
];

function trueFunc() {
  return true;
}

const AnnotatorContent: React.FC<AnnotatorContentProps> = (props) => {
  const {
    prefixMap,
    stickyAnnotationId,
    content,
    onRemove,
    onUpdate,
    onResetSticky,
    onCreateTerm,
    accessLevel,
    highlightedTerm,
  } = props;

  // Using memoization to skip processing and re-rendering of the content DOM in case it hasn't changed
  const reactComponents = React.useMemo(() => {
    const htmlToReactParser = new HtmlToReactParser();
    const processNodeDefinitions = new ProcessNodeDefinitions(React);
    const processingInstructions = [
      {
        // Custom annotated element processing
        shouldProcessNode: (node: any): boolean =>
          AnnotationDomHelper.isAnnotation(node, prefixMap),
        processNode: (node: DomHandlerNode, children?: React.ReactNode[]) => {
          const elem = node as DomHandlerElement;
          // filter annotations by score
          if (
            !AnnotationDomHelper.isAnnotationWithMinimumScore(
              elem,
              ANNOTATION_MINIMUM_SCORE_THRESHOLD
            )
          ) {
            return (
              <React.Fragment key={elem.attribs.about}>
                {children}
              </React.Fragment>
            );
          }
          const sticky = stickyAnnotationId === elem.attribs.about;

          const attribs = HtmlParserUtils.resolveRDFAttributes(
            elem.attribs,
            prefixMap
          );

          return (
            <Annotation
              key={elem.attribs.about}
              tag={elem.name}
              onRemove={onRemove}
              onUpdate={onUpdate}
              onResetSticky={onResetSticky}
              onCreateTerm={onCreateTerm}
              sticky={sticky}
              text={HtmlDomUtils.getTextContent(node)}
              accessLevel={accessLevel}
              highlight={
                highlightedTerm !== null &&
                elem.attribs.resource === highlightedTerm.iri
              }
              {...attribs}
            >
              {children}
            </Annotation>
          );
        },
      },
      {
        // Anything else
        shouldProcessNode: trueFunc,
        processNode: processNodeDefinitions.processDefaultNode,
      },
    ];

    return htmlToReactParser.parseWithInstructions(
      HtmlParserUtils.dom2html(content),
      trueFunc,
      processingInstructions,
      PREPROCESSING_INSTRUCTIONS
    );
  }, [
    prefixMap,
    stickyAnnotationId,
    content,
    onRemove,
    onUpdate,
    onResetSticky,
    onCreateTerm,
    accessLevel,
    highlightedTerm,
  ]);

  return (
    <>
      {Utils.sanitizeArray(reactComponents).map((n, i) => (
        <React.Fragment key={i}>{n}</React.Fragment>
      ))}
    </>
  );
};

export default AnnotatorContent;
