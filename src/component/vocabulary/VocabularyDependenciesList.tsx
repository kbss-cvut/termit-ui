import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {AssetData} from "../../model/Asset";
import Utils from "../../util/Utils";
import {Col, Label, Row} from "reactstrap";
import VocabularyIriLink from "./VocabularyIriLink";
import "./VocabularyDependenciesList.scss"

interface VocabularyDependenciesListProps extends HasI18n {
    vocabularies?: AssetData[];
}

export const VocabularyDependenciesList: React.FC<VocabularyDependenciesListProps> = props => {
    const vocabs = Utils.sanitizeArray(props.vocabularies);
    vocabs.sort((a: AssetData, b: AssetData) => a.iri!.localeCompare(b.iri!));
    return <Row>
        <Col xl={2} md={4}>
            <Label className="attribute-label">{props.i18n("vocabulary.detail.imports")}</Label>
        </Col>
        <Col xl={10} md={8}>
            <ul id="vocabulary-metadata-dependencies" className="ul-padding">
                {vocabs.map(v => <li key={v.iri}><VocabularyIriLink iri={v.iri!}/></li>)}
            </ul>
        </Col>
    </Row>;
};

export default injectIntl(withI18n(VocabularyDependenciesList));
