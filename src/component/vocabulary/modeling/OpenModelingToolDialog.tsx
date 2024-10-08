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
  const { formatMessage } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [relatedVocabularies, setRelatedVocabularies] = React.useState<
    string[]
  >([]);
  const modelingToolUrl = useSelector(
    (state: TermItState) => state.configuration
  ).modelingToolUrl;
  React.useEffect(() => {
    if (open) {
      dispatch(
        loadRelatedVocabularies(VocabularyUtils.create(vocabulary.iri))
      ).then((data) => setRelatedVocabularies(data));
    }
  }, [open, vocabulary.iri, dispatch]);
  const onOpen = () => {
    const vocabularyList = [vocabulary.iri, ...relatedVocabularies];
    let params = vocabularyList
      .map((v) => encodeURIComponent(v))
      .join("&vocabulary=");
    window.location.href = modelingToolUrl + "?vocabulary=" + params;
  };

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
    ></ConfirmCancelDialog>
  );
};

export default OpenModelingToolDialog;
