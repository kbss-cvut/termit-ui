import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import { useI18n } from "../../hook/useI18n";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { getLocalized } from "../../../model/MultilingualString";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { loadRelatedVocabularies } from "../../../action/AsyncVocabularyActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TermItState from "../../../model/TermItState";
import { loadVocabularies } from "../../../action/AsyncActions";
import { Col, Input, Row } from "reactstrap";
import { getShortLocale } from "../../../util/IntlUtil";
import "./OpenModelingToolDialog.scss";
import { trackPromise } from "react-promise-tracker";

const COLUMN_COUNT = 3;

interface OpenModelingToolDialogProps {
  open: boolean;
  onClose: () => void;
  vocabulary: Vocabulary;
}

const OpenModelingToolDialog: React.FC<OpenModelingToolDialogProps> = ({
  open,
  onClose,
  vocabulary,
}) => {
  const { formatMessage, i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [relatedVocabularies, setRelatedVocabularies] = React.useState<
    string[]
  >([]);
  const [selectedVocabularies, setSelectedVocabularies] = React.useState<
    string[]
  >([]);
  const modelingToolUrl = useSelector(
    (state: TermItState) => state.configuration
  ).modelingToolUrl;
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const vocabularyIris = Object.keys(vocabularies);
  React.useEffect(() => {
    if (!modelingToolUrl || !open || relatedVocabularies.length > 0) {
      return;
    }
    trackPromise(
      dispatch(loadRelatedVocabularies(VocabularyUtils.create(vocabulary.iri))),
      "vocabulary-summary"
    ).then((data = []) => {
      setRelatedVocabularies([...data, vocabulary.iri]);
      setSelectedVocabularies([...data, vocabulary.iri]);
    });
    if (Object.keys(vocabularies).length === 0) {
      dispatch(loadVocabularies());
    }
  }, [
    vocabulary.iri,
    vocabularies,
    dispatch,
    modelingToolUrl,
    open,
    relatedVocabularies.length,
  ]);

  const onSelect = (vIri: string) => {
    if (selectedVocabularies.includes(vIri)) {
      setSelectedVocabularies(selectedVocabularies.filter((v) => v !== vIri));
    } else {
      setSelectedVocabularies([...selectedVocabularies, vIri]);
    }
  };
  const onOpen = () => {
    let params = selectedVocabularies
      .map((v) => encodeURIComponent(v))
      .join("&vocabulary=");
    window.location.href = modelingToolUrl + "?vocabulary=" + params;
  };

  const rowCount = Math.ceil(vocabularyIris.length / COLUMN_COUNT);
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const cols = [];
    for (let j = 0; j < COLUMN_COUNT; j++) {
      const index = i * COLUMN_COUNT + j;
      if (index >= vocabularyIris.length) {
        break;
      }
      cols.push(
        <Col key={index} md={12 / COLUMN_COUNT}>
          <Input
            type="checkbox"
            checked={selectedVocabularies.includes(vocabularyIris[index])}
            disabled={relatedVocabularies.includes(vocabularyIris[index])}
            onChange={() => onSelect(vocabularyIris[index])}
            className="vocabulary-checkbox"
          />
          {getLocalized(
            vocabularies[vocabularyIris[index]].label,
            getShortLocale(locale)
          )}
        </Col>
      );
    }
    rows.push(
      <Row key={i} className="mb-2">
        {cols}
      </Row>
    );
  }

  return (
    <ConfirmCancelDialog
      id="vocabulary-model-dialog"
      show={open}
      onClose={onClose}
      confirmKey="vocabulary.summary.model.open"
      onConfirm={onOpen}
      title={formatMessage("vocabulary.summary.model.dialog.title", {
        vocabulary: getLocalized(vocabulary.label),
      })}
      size="lg"
      className="modeling-vocabulary-select-dialog"
    >
      <p className="mb-4">{i18n("vocabulary.summary.model.dialog.text")}</p>
      {rows}
    </ConfirmCancelDialog>
  );
};

export default OpenModelingToolDialog;
