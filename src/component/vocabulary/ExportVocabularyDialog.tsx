import React, { useState } from "react";
import Vocabulary from "../../model/Vocabulary";
import { useI18n } from "../hook/useI18n";
import { Col, Form, FormGroup, FormText, Input, Label, Row } from "reactstrap";
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
  const selectType = (selected: ExportType) => {
    setType(selected);
    if (
      selected !== ExportType.SKOS &&
      (format === ExportFormat.CSV || format === ExportFormat.Excel)
    ) {
      setFormat(ExportFormat.Turtle);
    }
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
      size="lg"
    >
      <Form>
        <FormGroup tag="fieldset" className="mb-0">
          <Row>
            <Col xs={7} lg={8}>
              <FormGroup check={true}>
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportType.SKOS}
                    value={ExportType.SKOS}
                    onChange={() => selectType(ExportType.SKOS)}
                    checked={type === ExportType.SKOS}
                  />
                  {i18n("vocabulary.summary.export.skos")}
                </Label>
                <FormText className="mb-2">
                  {i18n("vocabulary.summary.export.skos.title")}
                </FormText>
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportType.SKOS_FULL}
                    value={ExportType.SKOS_FULL}
                    onChange={() => selectType(ExportType.SKOS_FULL)}
                    checked={type === ExportType.SKOS_FULL}
                  />
                  {i18n("vocabulary.summary.export.skosFull")}
                </Label>
                <FormText className="mb-2">
                  {i18n("vocabulary.summary.export.skosFull.title")}
                </FormText>
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportType.SKOS_WITH_REFERENCES}
                    value={ExportType.SKOS_WITH_REFERENCES}
                    onChange={() => selectType(ExportType.SKOS_WITH_REFERENCES)}
                    checked={type === ExportType.SKOS_WITH_REFERENCES}
                  />
                  {i18n("vocabulary.summary.export.skosWithRefs")}
                </Label>
                <FormText className="mb-2">
                  {i18n("vocabulary.summary.export.skosWithRefs.title")}
                </FormText>
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportType.SKOS_FULL_WITH_REFERENCES}
                    value={ExportType.SKOS_FULL_WITH_REFERENCES}
                    onChange={() =>
                      selectType(ExportType.SKOS_FULL_WITH_REFERENCES)
                    }
                    checked={type === ExportType.SKOS_FULL_WITH_REFERENCES}
                  />
                  {i18n("vocabulary.summary.export.skosFullWithRefs")}
                </Label>
                <FormText className="mb-2">
                  {i18n("vocabulary.summary.export.skosFullWithRefs.title")}
                </FormText>
              </FormGroup>
            </Col>
            <Col xs={5} lg={4}>
              <FormGroup check={true}>
                {type === ExportType.SKOS && (
                  <>
                    <Label check={true}>
                      <Input
                        type="radio"
                        name={ExportFormat.CSV.mimeType}
                        value={ExportFormat.CSV.mimeType}
                        onChange={() => setFormat(ExportFormat.CSV)}
                        checked={
                          type === ExportType.SKOS &&
                          format === ExportFormat.CSV
                        }
                      />
                      {i18n("vocabulary.summary.export.csv")}
                    </Label>
                    <FormText>
                      {i18n("vocabulary.summary.export.csv.title")}
                    </FormText>
                  </>
                )}
                {type === ExportType.SKOS && (
                  <>
                    <Label check={true}>
                      <Input
                        type="radio"
                        name={ExportFormat.Excel.mimeType}
                        value={ExportFormat.Excel.mimeType}
                        onChange={() => setFormat(ExportFormat.Excel)}
                        checked={
                          type === ExportType.SKOS &&
                          format === ExportFormat.Excel
                        }
                      />
                      {i18n("vocabulary.summary.export.excel")}
                    </Label>
                    <FormText>
                      {i18n("vocabulary.summary.export.excel.title")}
                    </FormText>
                  </>
                )}
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportFormat.Turtle.mimeType}
                    value={ExportFormat.Turtle.mimeType}
                    onChange={() => setFormat(ExportFormat.Turtle)}
                    checked={format === ExportFormat.Turtle}
                  />
                  {i18n("vocabulary.summary.export.ttl")}
                </Label>
                <FormText>
                  {i18n("vocabulary.summary.export.ttl.title")}
                </FormText>
                <Label check={true}>
                  <Input
                    type="radio"
                    name={ExportFormat.RdfXml.mimeType}
                    value={ExportFormat.RdfXml.mimeType}
                    onChange={() => setFormat(ExportFormat.RdfXml)}
                    checked={format === ExportFormat.RdfXml}
                  />
                  {i18n("vocabulary.summary.export.rdfxml")}
                </Label>
                <FormText>
                  {i18n("vocabulary.summary.export.rdfxml.title")}
                </FormText>
              </FormGroup>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    </ConfirmCancelDialog>
  );
};

export default ExportVocabularyDialog;
