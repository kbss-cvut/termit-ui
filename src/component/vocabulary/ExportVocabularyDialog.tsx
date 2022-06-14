import React, { useState } from "react";
import Vocabulary from "../../model/Vocabulary";
import { useI18n } from "../hook/useI18n";
import {
  Button,
  ButtonToolbar,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import VocabularyUtils from "../../util/VocabularyUtils";
import {
  exportGlossary,
  exportGlossaryWithExactMatchReferences,
} from "../../action/AsyncVocabularyActions";
import ExportType from "../../util/ExportType";

interface ExportVocabularyDialogProps {
  show: boolean;
  onClose: () => void;
  vocabulary: Vocabulary;
}

const Type = {
  CSV: "csv",
  EXCEL: "excel",
  SKOS: "skos",
  SKOS_WITH_REFS: "skosWithRefs",
};

const ExportVocabularyDialog: React.FC<ExportVocabularyDialogProps> = ({
  show,
  onClose,
  vocabulary,
}) => {
  const { i18n } = useI18n();
  const [type, setType] = useState(Type.CSV);
  const dispatch: ThunkDispatch = useDispatch();
  const onExport = () => {
    const iri = VocabularyUtils.create(vocabulary.iri);
    switch (type) {
      case Type.CSV:
        dispatch(exportGlossary(iri, ExportType.CSV)).then(onClose);
        break;
      case Type.EXCEL:
        dispatch(exportGlossary(iri, ExportType.Excel)).then(onClose);
        break;
      case Type.SKOS:
        dispatch(exportGlossary(iri, ExportType.Turtle)).then(onClose);
        break;
      case Type.SKOS_WITH_REFS:
        dispatch(exportGlossaryWithExactMatchReferences(iri)).then(onClose);
        break;
    }
  };

  return (
    <Modal isOpen={show} toggle={onClose}>
      <ModalHeader toggle={onClose}>
        {i18n("vocabulary.summary.export.title")}
      </ModalHeader>
      <ModalBody>
        <FormGroup tag="fieldset">
          <FormGroup check={true}>
            <Label check={true}>
              <Input
                type="radio"
                name={Type.CSV}
                value={Type.CSV}
                onChange={() => setType(Type.CSV)}
                checked={type === Type.CSV}
              />
              {i18n("vocabulary.summary.export.csv")}
            </Label>
            <FormText>{i18n("vocabulary.summary.export.csv.title")}</FormText>
          </FormGroup>
          <FormGroup check={true}>
            <Label check={true}>
              <Input
                type="radio"
                name={Type.EXCEL}
                value={Type.EXCEL}
                onChange={() => setType(Type.EXCEL)}
                checked={type === Type.EXCEL}
              />
              {i18n("vocabulary.summary.export.excel")}
            </Label>
            <FormText>{i18n("vocabulary.summary.export.excel.title")}</FormText>
          </FormGroup>
          <FormGroup check={true}>
            <Label check={true}>
              <Input
                type="radio"
                name={Type.SKOS}
                value={Type.SKOS}
                onChange={() => setType(Type.SKOS)}
                checked={type === Type.SKOS}
              />
              {i18n("vocabulary.summary.export.ttl")}
            </Label>
            <FormText>{i18n("vocabulary.summary.export.ttl.title")}</FormText>
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
              {i18n("vocabulary.summary.export.ttl.withRefs")}
            </Label>
            <FormText>
              {i18n("vocabulary.summary.export.ttl.withRefs.title")}
            </FormText>
          </FormGroup>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <ButtonToolbar className="pull-right">
          <Button
            id="export-vocabulary-submit"
            color="primary"
            size="sm"
            onClick={onExport}
          >
            {i18n("vocabulary.summary.export.text")}
          </Button>
          <Button
            id="remove-asset-cancel"
            color="outline-dark"
            size="sm"
            onClick={onClose}
          >
            {i18n("cancel")}
          </Button>
        </ButtonToolbar>
      </ModalFooter>
    </Modal>
  );
};

export default ExportVocabularyDialog;
