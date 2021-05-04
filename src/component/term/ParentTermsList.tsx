import * as React from "react";
import Term, {TERM_BROADER_SUBPROPERTIES} from "../../model/Term";
import Utils from "../../util/Utils";
// @ts-ignore
import {Col, Label, List, Row} from "reactstrap";
import TermLink from "./TermLink";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import OutgoingLink from "../misc/OutgoingLink";
import {getLocalized} from "../../model/MultilingualString";
import {useI18n} from "../hook/useI18n";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import {FaAngleRight} from "react-icons/fa";
import Workspace from "../../model/Workspace";

interface ParentTermsListProps {
    term: Term;
    language: string;
}

function renderTermList(parents: Term[], workspace: Workspace, language: string) {
    parents.sort(Utils.labelComparator);
    return <>
        {parents.map((item) => (
            <li key={item.iri}>
                {workspace.containsVocabulary(item.vocabulary!.iri!) ? (
                    <>
                        <VocabularyNameBadge
                            className="mr-1 align-text-bottom"
                            vocabulary={item.vocabulary}
                        />
                        <TermLink term={item} language={language}/>
                    </>
                ) : (
                    <OutgoingLink
                        label={
                            <>
                                <VocabularyNameBadge
                                    className="mr-1 align-text-bottom"
                                    vocabulary={item.vocabulary}
                                />
                                {getLocalized(item.label, language)}
                            </>
                        }
                        iri={item.iri}
                    />
                )}
            </li>
        ))}
    </>;
}

function renderParentSubProperties(term: Term, workspace: Workspace, i18n: (msgId: string) => string, language: string) {
    return <>
        {TERM_BROADER_SUBPROPERTIES.map(bsp => <Row key={bsp.attribute} className="mt-1">
            <Col xl={2} md={4}>
                <Label className="attribute-label ml-2 term-broader-subproperty-label">
                    <FaAngleRight className="mr-1 mb-1"/>
                    {i18n(bsp.i18nKey)}
                </Label>
            </Col>
            <Col xl={10} md={8}>
                <List type="unstyled" id="term-metadata-supertypes" className="mb-0">
                    {renderTermList(Utils.sanitizeArray(term[bsp.attribute]), workspace, language)}
                </List>
            </Col>
        </Row>)}
    </>;
}

const ParentTermsList: React.FC<ParentTermsListProps> = (props) => {
    const {term, language} = props;
    const {i18n} = useI18n();
    const workspace = useSelector((state: TermItState) => state.workspace)!;

    const parents = Utils.sanitizeArray(term.parentTerms);
    parents.sort(Utils.labelComparator);
    return (
        <div className="mb-3">
            <Row>
                <Col xl={2} md={4}>
                    <Label className="attribute-label">
                        {i18n("term.metadata.parent")}
                    </Label>
                </Col>
                <Col xl={10} md={8}>
                    <List type="unstyled" id="term-metadata-parentterms" className="mb-0">
                        {renderTermList(parents, workspace, language)}
                    </List>
                </Col>
            </Row>
            {renderParentSubProperties(term, workspace, i18n, language)}
        </div>
    );
};

export default ParentTermsList;
