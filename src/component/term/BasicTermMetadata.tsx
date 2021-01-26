import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {termInfoComparator} from "../../model/Term";
import {injectIntl} from "react-intl";
import {Col, Label, Row} from "reactstrap";
import VocabularyIriLink from "../vocabulary/VocabularyIriLink";
import Utils from "../../util/Utils";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermLink from "./TermLink";
import TermDefinitionSourceLink from "./TermDefinitionSourceLink";
import {OWL, SKOS} from "../../util/Namespaces";
import {getLocalizedOrDefault} from "../../model/MultilingualString";
import TermDefinitionContainer from "./TermDefinitionContainer";

interface BasicTermMetadataProps extends HasI18n {
    term: Term;
    withDefinitionSource?: boolean;
    language: string;
}

export class BasicTermMetadata extends React.Component<BasicTermMetadataProps, any> {

    public static defaultProps: Partial<BasicTermMetadataProps> = {
        withDefinitionSource: false
    };

    public render() {
        const {i18n, term, language} = this.props;
        return <>
            {this.renderTermDefinition()}
            <Row>
                <Col xl={2} md={4}>
                    <Label className="attribute-label mb-3">{i18n("term.metadata.types")}</Label>
                </Col>
                <Col xl={10} md={8}>{this.renderTypes()}
                </Col>
            </Row>
            {this.renderParentTerms()}
            {this.renderSubTerms()}
            <Row>
                <Col xl={2} md={4}>
                    <Label className="attribute-label mb-3">{i18n("term.metadata.comment")}</Label>
                </Col>
                <Col xl={10} md={8}>
                    <p id="term-metadata-comment">{getLocalizedOrDefault(term.scopeNote, "", language)}</p>
                </Col>
            </Row>
            <Row>
                <Col xl={2} md={4}>
                    <Label className="attribute-label"
                           title={i18n("term.metadata.vocabulary.tooltip")}>{i18n("type.vocabulary")}</Label>
                </Col>
                <Col xl={10} md={8}>
                    <VocabularyIriLink id="term-metadata-vocabulary" iri={term.vocabulary!.iri!}/>
                </Col>
            </Row>
        </>;
    }

    private renderTermDefinition() {
        const {term, language, i18n} = this.props;
        const sources = Utils.sanitizeArray(term.sources);
        return <TermDefinitionContainer>
            <Row>
                <Col xs={12}>
                    <p id="term-metadata-definition"
                       className="lead mb-1">{getLocalizedOrDefault(term.definition, "", language)}</p>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {sources.length > 0 && <footer className="blockquote-footer mb-1 term-metadata-definition-source">
                        {sources.map(s => {
                            return <>
                                <cite key={s} title={i18n("term.metadata.definitionSource.title")}>
                                    {Utils.isLink(s) ? <OutgoingLink iri={s} label={<AssetLabel iri={s}/>}/> : <>{s}</>}
                                </cite>
                                {this.renderDefinitionSource()}
                            </>;
                        })}
                    </footer>}
                </Col>
            </Row>
        </TermDefinitionContainer>;
    }

    private renderDefinitionSource() {
        if (!this.props.withDefinitionSource || !this.props.term.definitionSource) {
            return null;
        }
        return <TermDefinitionSourceLink term={this.props.term}/>;
    }

    private renderTypes() {
        // Ensures that the implicit TERM type is not rendered
        const types = this.props.term.types;
        return BasicTermMetadata.renderItems(Utils.sanitizeArray(types)
                .filter(t =>
                    t !== VocabularyUtils.TERM
                    && !t.startsWith(SKOS.namespace)
                    && !t.startsWith(OWL.namespace)
                ),
            "term-metadata-types");
    }

    private static renderItems(items: string[] | string | undefined, containerId?: string) {
        const source = Utils.sanitizeArray(items);
        if (source.length === 0) {
            return null;
        }

        const renderItem = (item: string) => Utils.isLink(item) ?
            <OutgoingLink iri={item} label={<AssetLabel iri={item}/>}/> : <p>{item}</p>

        if (source.length === 1) {
            return renderItem(source[0]);
        } else {
            return <ul id={containerId} className="term-items">
                {source.map((item: string) => <li key={item}>{renderItem(item)}</li>)}
            </ul>
        }
    }

    private renderParentTerms() {
        const parents = Utils.sanitizeArray(this.props.term.parentTerms);
        parents.sort(Utils.labelComparator);
        return <Row>
            <Col xl={2} md={4}>
                <Label className="attribute-label mb-3">{this.props.i18n("term.metadata.parent")}</Label>
            </Col>
            <Col xl={10} md={8}>
                <ul id="term-metadata-parentterms" className="term-items">
                    {parents.map(item => <li key={item.iri}>
                        <TermLink term={item} language={this.props.language}/>
                    </li>)}
                </ul>
            </Col>
        </Row>;
    }

    private renderSubTerms() {
        const source = Utils.sanitizeArray(this.props.term.subTerms);
        source.sort(termInfoComparator);
        return <Row>
            <Col xl={2} md={4}>
                <Label className="attribute-label mb-3">{this.props.i18n("term.metadata.subTerms")}</Label>
            </Col>
            <Col xl={10} md={8}>
                <ul id="term-metadata-subterms" className="term-items">{source.map(item => <li key={item.iri}>
                    <TermLink term={item} language={this.props.language}/>
                </li>)}
                </ul>
            </Col>
        </Row>;
    }
}

export default injectIntl(withI18n(BasicTermMetadata));
