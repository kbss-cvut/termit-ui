import * as React from "react";
import {injectIntl} from "react-intl";
import {Instruction, Parser as HtmlToReactParser, ProcessNodeDefinitions} from "html-to-react";
import {Col, Row} from "reactstrap";
import withI18n, {HasI18n} from "../../hoc/withI18n";

interface FTSMatchProps extends HasI18n {
    match: string;
}

const isValidNode = () => true;

const processingInstructions: Instruction[] = [{
    shouldProcessNode: node => {
        // Process only nodes representing the mach
        return node && node.name === "em";
    },

    processNode: (node: any, children: any) => {
        // Render matches in the snippet with some sort of emphasis
        return <span key={Math.random()} className="search-result-snippet-match">{children}</span>;
    }
},
    {
        // Anything else
        shouldProcessNode: (): boolean => {
            return true;
        },
        processNode: new ProcessNodeDefinitions(React).processDefaultNode
    }
];

/**
 * Renders the matching field and text snippet with the match(es) visualizing the match(es) in the text.
 */
export const FTSMatch: React.FC<FTSMatchProps> = (props: FTSMatchProps) => {
    const parser = new HtmlToReactParser();
    return <Row key={props.match}>
        <Col md={9} lg={10} xl={11}>
            <React.Fragment>{parser.parseWithInstructions(props.match, isValidNode, processingInstructions)}</React.Fragment>
        </Col>
    </Row>;
}

export default injectIntl(withI18n(FTSMatch));
