import React, { useState } from "react";
import Vocabulary from "../../model/Vocabulary";
import { useI18n } from "../hook/useI18n";
import { Form, FormGroup, FormText, Input, Label } from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import VocabularyUtils from "../../util/VocabularyUtils";
import { exportGlossary } from "../../action/AsyncVocabularyActions";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import ExportConfig, {
  ExportFormat,
  ExportType,
} from "../../model/local/ExportConfig";

interface ExportVocabularyDialogProps {
  show: boolean;
  onClose: () => void;
  vocabulary: Vocabulary;
}

const ExportVocabularyDialog: React.FC<ExportVocabularyDialogProps> = ({
  show,
  onClose,
  vocabulary,
}) => {
  const { i18n } = useI18n();
  const [type, setType] = useState(ExportType.SKOS);
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.Turtle);
  const selectSkos = (format: ExportFormat) => {
    setType(ExportType.SKOS);
    setFormat(format);
  };
  const selectSkosWithRefs = (format: ExportFormat) => {
    setType(ExportType.SKOS_WITH_REFERENCES);
    setFormat(format);
  };
  const dispatch: ThunkDispatch = useDispatch();
  const onExport = () => {
    const iri = VocabularyUtils.create(vocabulary.iri);
    const config = new ExportConfig(type, format);
    if (
      type === ExportType.SKOS_WITH_REFERENCES ||
      type === ExportType.SKOS_FULL_WITH_REFERENCES
    ) {
      config.referenceProperties = [VocabularyUtils.SKOS_EXACT_MATCH];
    }
    dispatch(exportGlossary(iri, config)).then(onClose);
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
                name={ExportType.SKOS}
                value={ExportType.SKOS}
                onChange={() => setType(ExportType.SKOS)}
                checked={type === ExportType.SKOS}
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
                  name={ExportFormat.CSV.mimeType}
                  value={ExportFormat.CSV.mimeType}
                  onChange={() => selectSkos(ExportFormat.CSV)}
                  checked={
                    type === ExportType.SKOS && format === ExportFormat.CSV
                  }
                />
                {i18n("vocabulary.summary.export.csv")}
              </Label>
              <FormText>{i18n("vocabulary.summary.export.csv.title")}</FormText>
            </FormGroup>
            <FormGroup check={true} className="ml-2">
              <Label check={true}>
                <Input
                  type="radio"
                  name={ExportFormat.Excel.mimeType}
                  value={ExportFormat.Excel.mimeType}
                  onChange={() => selectSkos(ExportFormat.Excel)}
                  checked={
                    type === ExportType.SKOS && format === ExportFormat.Excel
                  }
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
                  name={ExportFormat.Turtle.mimeType}
                  value={ExportFormat.Turtle.mimeType}
                  onChange={() => selectSkos(ExportFormat.Turtle)}
                  checked={
                    type === ExportType.SKOS && format === ExportFormat.Turtle
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
                  name={ExportFormat.RdfXml.mimeType}
                  value={ExportFormat.RdfXml.mimeType}
                  onChange={() => selectSkos(ExportFormat.RdfXml)}
                  checked={
                    type === ExportType.SKOS && format === ExportFormat.RdfXml
                  }
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
                name={ExportType.SKOS_WITH_REFERENCES}
                value={ExportType.SKOS_WITH_REFERENCES}
                onChange={() => {
                  setType(ExportType.SKOS_WITH_REFERENCES);
                  setFormat(ExportFormat.Turtle);
                }}
                checked={type === ExportType.SKOS_WITH_REFERENCES}
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
                  name={`${ExportFormat.Turtle.mimeType}-withRefs`}
                  value={ExportFormat.Turtle.mimeType}
                  onChange={() => selectSkosWithRefs(ExportFormat.Turtle)}
                  checked={
                    type === ExportType.SKOS_WITH_REFERENCES &&
                    format === ExportFormat.Turtle
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
                  name={`${ExportFormat.RdfXml.mimeType}-withRefs`}
                  value={ExportFormat.RdfXml.mimeType}
                  onChange={() => selectSkosWithRefs(ExportFormat.RdfXml)}
                  checked={
                    type === ExportType.SKOS_WITH_REFERENCES &&
                    format === ExportFormat.RdfXml
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
