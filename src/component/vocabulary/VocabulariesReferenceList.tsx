import * as React from "react";
import { AssetData } from "../../model/Asset";
import Utils from "../../util/Utils";
import { Col, Label, Row } from "reactstrap";
import VocabularyIriLink from "./VocabularyIriLink";
import "./VocabulariesReferenceList.scss";
import { useI18n } from "../hook/useI18n";

interface VocabulariesReferenceListProps {
  vocabularies?: AssetData[];
  labelKey: string;
  htmlId: string;
}

export const VocabulariesReferenceList: React.FC<
  VocabulariesReferenceListProps
> = ({ vocabularies, labelKey, htmlId }) => {
  const { i18n } = useI18n();
  const vocabs = Utils.sanitizeArray(vocabularies);
  vocabs.sort((a: AssetData, b: AssetData) => a.iri!.localeCompare(b.iri!));

  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">{i18n(labelKey as any)}</Label>
      </Col>
      <Col xl={10} md={8}>
        <ul id={htmlId} className="ul-padding">
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

export default VocabulariesReferenceList;
