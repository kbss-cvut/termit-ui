import React, { useEffect, useState } from "react";
import SnapshotData from "../../../model/Snapshot";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { useI18n } from "../../hook/useI18n";
import { Label } from "reactstrap";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { loadRelatedVocabularies } from "../../../action/AsyncVocabularyActions";
import VocabularyUtils from "../../../util/VocabularyUtils";

interface RemoveSnapshotDialogProps {
  snapshot: SnapshotData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const RemoveSnapshotDialog: React.FC<RemoveSnapshotDialogProps> = ({
  snapshot,
  onConfirm,
  onCancel,
}) => {
  const { i18n, formatMessage } = useI18n();
  const [related, setRelated] = useState<string[]>([]);
  const dispatch: ThunkDispatch = useDispatch();
  useEffect(() => {
    if (snapshot != null) {
      dispatch(
        loadRelatedVocabularies(VocabularyUtils.create(snapshot.iri))
      ).then((data) => setRelated(data));
    }
  }, [dispatch, snapshot]);
  return (
    <ConfirmCancelDialog
      show={snapshot !== null}
      id="remove-snapshot"
      confirmKey="remove"
      onClose={onCancel}
      onConfirm={onConfirm}
      title={i18n("snapshot.remove.confirm.title")}
    >
      <Label>
        {related.length > 0
          ? formatMessage("snapshot.remove.confirm.text", {
              count: related.length - 1,
            })
          : i18n("snapshot.remove.confirm.text.no-related")}
      </Label>
    </ConfirmCancelDialog>
  );
};

export default RemoveSnapshotDialog;
