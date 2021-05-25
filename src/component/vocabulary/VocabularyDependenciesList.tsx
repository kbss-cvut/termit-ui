import * as React from "react";
import { AssetData } from "../../model/Asset";
import Utils from "../../util/Utils";
import { Col, Label, Row } from "reactstrap";
import VocabularyIriLink from "./VocabularyIriLink";
import "./VocabularyDependenciesList.scss";
import { useI18n } from "../hook/useI18n";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";

interface VocabularyDependenciesListProps {
  vocabularies?: AssetData[];
}

export const VocabularyDependenciesList: React.FC<VocabularyDependenciesListProps> =
  (props) => {
    const { i18n } = useI18n();
    const workspace = useSelector((state: TermItState) => state.workspace);
    const vocabs = Utils.sanitizeArray(props.vocabularies);
    vocabs.sort((a: AssetData, b: AssetData) => a.iri!.localeCompare(b.iri!));

    return (
      <Row>
        <Col xl={2} md={4}>
          <Label className="attribute-label">
            {i18n("vocabulary.detail.imports")}
          </Label>
        </Col>
        <Col xl={10} md={8}>
          <ul id="vocabulary-metadata-dependencies" className="ul-padding">
            {vocabs.map((v) => (
              <li key={v.iri}>
                {workspace?.containsVocabulary(v.iri) ? (
                  <VocabularyIriLink iri={v.iri!} />
                ) : (
                  <OutgoingLink
                    iri={v.iri!}
                    label={<AssetLabel iri={v.iri!} />}
                  />
                )}
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    );
  };

export default VocabularyDependenciesList;
