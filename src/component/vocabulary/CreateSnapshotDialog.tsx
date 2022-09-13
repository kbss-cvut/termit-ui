import React, { useEffect, useState } from "react";
import { useI18n } from "../hook/useI18n";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { Label } from "reactstrap";
import Vocabulary from "../../model/Vocabulary";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadRelatedVocabularies } from "../../action/AsyncVocabularyActions";
import VocabularyUtils from "../../util/VocabularyUtils";

interface CreateSnapshotDialogProps {
  vocabulary: Vocabulary;
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CreateSnapshotDialog: React.FC<CreateSnapshotDialogProps> = ({
  vocabulary,
  show,
  onClose,
  onConfirm,
}) => {
  const { i18n, formatMessage } = useI18n();
  const [related, setRelated] = useState<string[]>([]);
  const dispatch: ThunkDispatch = useDispatch();
  useEffect(() => {
    dispatch(
      loadRelatedVocabularies(VocabularyUtils.create(vocabulary.iri))
    ).then((data) => setRelated(data));
  }, [dispatch, vocabulary.iri]);

  return (
    <ConfirmCancelDialog
      show={show}
      id="create-snapshot"
      confirmKey="vocabulary.snapshot.create.dialog.confirm"
      onClose={onClose}
      onConfirm={onConfirm}
      title={i18n("vocabulary.snapshot.create.label")}
    >
      <Label>
        {related.length > 0
          ? formatMessage("vocabulary.snapshot.create.dialog.text", {
              count: related.length - 1,
            })
          : i18n("vocabulary.snapshot.create.dialog.text.no-related")}
      </Label>
    </ConfirmCancelDialog>
  );
};

export default CreateSnapshotDialog;
