import * as React from "react";
import { AssetData } from "../../model/Asset";
import Utils from "../../util/Utils";
import { Col, Label, Row } from "reactstrap";
import VocabularyIriLink from "./VocabularyIriLink";
import "./ImportedVocabulariesList.scss";
import { useI18n } from "../hook/useI18n";

interface ImportedVocabulariesListProps {
  vocabularies?: AssetData[];
}

export const ImportedVocabulariesList: React.FC<ImportedVocabulariesListProps> =
  (props: ImportedVocabulariesListProps) => {
    const { i18n } = useI18n();
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
          <ul
            id="vocabulary-metadata-importedVocabularies"
            className="ul-padding"
          >
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

export default ImportedVocabulariesList;
