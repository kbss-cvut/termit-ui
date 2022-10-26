import React, { useState } from "react";
import Vocabulary from "../../model/Vocabulary";
import { useI18n } from "../hook/useI18n";
import { Form, FormGroup, FormText, Input, Label } from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import VocabularyUtils from "../../util/VocabularyUtils";
import {
  exportGlossary,
  exportGlossaryWithExactMatchReferences,
} from "../../action/AsyncVocabularyActions";
import ExportType from "../../util/ExportType";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";

interface ExportVocabularyDialogProps {
  show: boolean;
  onClose: () => void;
  vocabulary: Vocabulary;
}

const Type = {
  SKOS: "skos",
  SKOS_WITH_REFS: "skosWithRefs",
};

const ExportVocabularyDialog: React.FC<ExportVocabularyDialogProps> = ({
  show,
  onClose,
  vocabulary,
}) => {
  const { i18n } = useI18n();
  const [type, setType] = useState(Type.SKOS);
  // @ts-ignore
  const [format, setFormat] = useState<ExportType | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  const onExport = () => {
    const iri = VocabularyUtils.create(vocabulary.iri);
    switch (format) {
      case ExportType.CSV:
        dispatch(exportGlossary(iri, ExportType.CSV)).then(onClose);
        break;
      case ExportType.Excel:
        dispatch(exportGlossary(iri, ExportType.Excel)).then(onClose);
        break;
      case ExportType.Turtle:
        if (type === Type.SKOS) {
          dispatch(exportGlossary(iri, ExportType.Turtle)).then(onClose);
        } else {
          dispatch(
            exportGlossaryWithExactMatchReferences(iri, ExportType.Turtle)
          ).then(onClose);
        }
        break;
      case ExportType.RdfXml:
        if (type === Type.SKOS) {
          dispatch(exportGlossary(iri, ExportType.RdfXml)).then(onClose);
        } else {
          dispatch(
            exportGlossaryWithExactMatchReferences(iri, ExportType.RdfXml)
          ).then(onClose);
        }
        break;
    }
  };

  return (
    <ConfirmCancelDialog
      show={show}
      id="vocabulary-export"
      confirmKey="vocabulary.summary.export.text"
      onClose={onClose}
      onConfirm={onExport}
      title={i18n("vocabulary.summary.export.title")}
    >
      <Form>
        <FormGroup tag="fieldset">
          <FormGroup check={true} className="mb-3">
            <Label check={true}>
              <Input
                type="radio"
                name={Type.SKOS}
                value={Type.SKOS}
                onChange={() => setType(Type.SKOS)}
                checked={type === Type.SKOS}
              />
              {i18n("vocabulary.summary.export.skos")}
            </Label>
            <FormText className="mb-2">
              {i18n("vocabulary.summary.export.skos.title")}
            </FormText>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={ExportType.CSV.mimeType}
                  value={ExportType.CSV.mimeType}
                  onChange={() => setFormat(ExportType.CSV)}
                  checked={type === Type.SKOS && format === ExportType.CSV}
                />
                {i18n("vocabulary.summary.export.csv")}
              </Label>
              <FormText>{i18n("vocabulary.summary.export.csv.title")}</FormText>
            </FormGroup>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={ExportType.Excel.mimeType}
                  value={ExportType.Excel.mimeType}
                  onChange={() => setFormat(ExportType.Excel)}
                  checked={type === Type.SKOS && format === ExportType.Excel}
                />
                {i18n("vocabulary.summary.export.excel")}
              </Label>
              <FormText>
                {i18n("vocabulary.summary.export.excel.title")}
              </FormText>
            </FormGroup>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={ExportType.Turtle.mimeType}
                  value={ExportType.Turtle.mimeType}
                  onChange={() => setFormat(ExportType.Turtle)}
                  checked={type === Type.SKOS && format === ExportType.Turtle}
                />
                {i18n("vocabulary.summary.export.ttl")}
              </Label>
              <FormText>{i18n("vocabulary.summary.export.ttl.title")}</FormText>
            </FormGroup>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={ExportType.RdfXml.mimeType}
                  value={ExportType.RdfXml.mimeType}
                  onChange={() => setFormat(ExportType.RdfXml)}
                  checked={type === Type.SKOS && format === ExportType.RdfXml}
                />
                {i18n("vocabulary.summary.export.rdfxml")}
              </Label>
              <FormText>
                {i18n("vocabulary.summary.export.rdfxml.title")}
              </FormText>
            </FormGroup>
          </FormGroup>
          <FormGroup check={true}>
            <Label check={true}>
              <Input
                type="radio"
                name={Type.SKOS_WITH_REFS}
                value={Type.SKOS_WITH_REFS}
                onChange={() => setType(Type.SKOS_WITH_REFS)}
                checked={type === Type.SKOS_WITH_REFS}
              />
              {i18n("vocabulary.summary.export.skosWithRefs")}
            </Label>
            <FormText className="mb-2">
              {i18n("vocabulary.summary.export.skosWithRefs.title")}
            </FormText>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={`${ExportType.Turtle.mimeType}-withRefs`}
                  value={ExportType.Turtle.mimeType}
                  onChange={() => setFormat(ExportType.Turtle)}
                  checked={
                    type === Type.SKOS_WITH_REFS && format === ExportType.Turtle
                  }
                />
                {i18n("vocabulary.summary.export.ttl")}
              </Label>
              <FormText>{i18n("vocabulary.summary.export.ttl.title")}</FormText>
            </FormGroup>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={`${ExportType.RdfXml.mimeType}-withRefs`}
                  value={ExportType.RdfXml.mimeType}
                  onChange={() => setFormat(ExportType.RdfXml)}
                  checked={
                    type === Type.SKOS_WITH_REFS && format === ExportType.RdfXml
                  }
                />
                {i18n("vocabulary.summary.export.rdfxml")}
              </Label>
              <FormText>
                {i18n("vocabulary.summary.export.rdfxml.title")}
              </FormText>
            </FormGroup>
          </FormGroup>
        </FormGroup>
      </Form>
    </ConfirmCancelDialog>
  );
};

export default ExportVocabularyDialog;
