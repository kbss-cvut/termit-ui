import * as React from "react";
import {
  Instruction,
  Parser as HtmlToReactParser,
  ProcessNodeDefinitions,
} from "html-to-react";

interface FTSMatchProps {
  match: string;
}

const isValidNode = () => true;

const processingInstructions: Instruction[] = [
  {
    shouldProcessNode: (node) => {
      // Process only nodes representing the mach
      return node && node.name === "em";
    },

    processNode: (node: any, children: any) => {
      // Render matches in the snippet with some sort of emphasis
      return (
        <span key={Math.random()} className="search-result-snippet-match">
          {children}
        </span>
      );
    },
  },
  {
    // Anything else
    shouldProcessNode: (): boolean => {
      return true;
    },
    processNode: new ProcessNodeDefinitions(React).processDefaultNode,
  },
];

/**
 * Renders the matching field and text snippet with the match(es) visualizing the match(es) in the text.
 */
export const FTSMatch: React.FC<FTSMatchProps> = (props: FTSMatchProps) => {
  const parser = new HtmlToReactParser();
  return (
    <div key={props.match}>
      <React.Fragment>
        {parser.parseWithInstructions(
          props.match,
          isValidNode,
          processingInstructions
        )}
      </React.Fragment>
    </div>
  );
};

export default FTSMatch;
