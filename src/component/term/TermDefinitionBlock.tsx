import * as React from "react";
import {Col, Row} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import {injectIntl} from "react-intl";
import TermDefinitionContainer from "./TermDefinitionContainer";
import {getLocalizedOrDefault} from "../../model/MultilingualString";
import TermDefinitionSource from "./TermDefinitionSource";
import "./TermDefinitionBlock.scss";

export interface TermDefinitionBlockProps extends HasI18n {
    term: Term;
    language: string;
    withDefinitionSource?: boolean;
}

export const TermDefinitionBlock: React.FC<TermDefinitionBlockProps> = props => {
    const {term, language} = props;
    return <TermDefinitionContainer>
        <Row>
            <Col xs={12}>
                <p id="term-metadata-definition"
                   className="lead mb-1">{getLocalizedOrDefault(term.definition, "", language)}</p>
            </Col>
        </Row>
        <Row>
            <TermDefinitionSource term={term} language={language} withDefinitionSource={props.withDefinitionSource}/>
        </Row>
    </TermDefinitionContainer>;
};

TermDefinitionBlock.defaultProps = {
    withDefinitionSource: false
};

export default injectIntl(withI18n(TermDefinitionBlock));
