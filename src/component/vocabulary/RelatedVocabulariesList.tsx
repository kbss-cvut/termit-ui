import * as React from "react";
import { AssetData } from "../../model/Asset";
import Utils from "../../util/Utils";
import { Col, Label, Row } from "reactstrap";
import VocabularyIriLink from "./VocabularyIriLink";
import "./ImportedVocabulariesList.scss";
import { useI18n } from "../hook/useI18n";

interface RelatedVocabulariesListProps {
  vocabularies?: AssetData[];
}

export const RelatedVocabulariesList: React.FC<RelatedVocabulariesListProps> = (
  props: RelatedVocabulariesListProps
) => {
  const { i18n } = useI18n();
  const vocabs = Utils.sanitizeArray(props.vocabularies);
  vocabs.sort((a: AssetData, b: AssetData) => a.iri!.localeCompare(b.iri!));
  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">
          {i18n("vocabulary.detail.related")}
        </Label>
      </Col>
      <Col xl={10} md={8}>
        <ul id="vocabulary-metadata-relatedVocabularies" className="ul-padding">
          {vocabs.map((v) => (
            <li key={v.iri}>
              <VocabularyIriLink iri={v.iri!} />
            </li>
          ))}
        </ul>
      </Col>
    </Row>
  );
};

export default RelatedVocabulariesList;
