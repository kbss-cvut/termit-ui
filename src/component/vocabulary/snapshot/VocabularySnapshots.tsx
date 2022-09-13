import React, { useEffect, useState } from "react";
import Vocabulary from "../../../model/Vocabulary";
import { useI18n } from "../../hook/useI18n";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import SnapshotData from "../../../model/Snapshot";
import TermItState from "../../../model/TermItState";
import { loadVocabularySnapshots } from "../../../action/AsyncVocabularyActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import NotificationType from "../../../model/NotificationType";
import { consumeNotification } from "../../../action/SyncActions";
import { removeSnapshot } from "../../../action/AsyncActions";
import { CellProps, Column } from "react-table";
import { FormattedDate, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import Routes from "../../../util/Routes";
import SnapshotsTable from "../../snapshot/SnapshotsTable";
import RemoveSnapshotDialog from "./RemoveSnapshotDialog";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import IfUserIsAdmin from "../../authorization/IfUserIsAdmin";

interface VocabularySnapshotsProps {
  asset: Vocabulary;
}

function resolvePath(snapshot: SnapshotData, asset: Vocabulary) {
  const iri = VocabularyUtils.create(snapshot.iri);
  const assetIri = VocabularyUtils.create(asset.iri);
  return Routes.vocabularySnapshotSummary.link(
    { name: assetIri.fragment, timestamp: iri.fragment },
    { namespace: assetIri.namespace }
  );
}

const VocabularySnapshots: React.FC<VocabularySnapshotsProps> = ({ asset }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [toRemove, setToRemove] = useState<SnapshotData | null>(null);
  const notifications = useSelector(
    (state: TermItState) => state.notifications
  );
  useEffect(() => {
    dispatch(loadVocabularySnapshots(VocabularyUtils.create(asset.iri))).then(
      (data) => setSnapshots(data)
    );
  }, [asset.iri, dispatch, setSnapshots]);
  useEffect(() => {
    const event = notifications.find(
      (n) => n.source.type === NotificationType.SNAPSHOT_COUNT_CHANGED
    );
    if (event) {
      dispatch(consumeNotification(event));
      dispatch(loadVocabularySnapshots(VocabularyUtils.create(asset.iri))).then(
        (data) => setSnapshots(data)
      );
    }
  }, [asset.iri, dispatch, notifications, setSnapshots]);
  const onRemoveClick = React.useCallback(
    (snapshot) => {
      setToRemove(snapshot);
    },
    [setToRemove]
  );
  const onRemove = () => {
    trackPromise(
      dispatch(removeSnapshot(VocabularyUtils.create(toRemove!.iri))),
      "vocabulary-snapshots"
    ).then(() => setToRemove(null));
  };

  const columns: Column<SnapshotData>[] = React.useMemo(
    () => [
      {
        Header: i18n("snapshots.created"),
        accessor: "created",
        className: "align-middle",
        Cell: ({ row }) => {
          const created = new Date(row.original.created);
          return (
            <>
              <FormattedDate value={created} />
              &nbsp;
              <FormattedTime value={created} />
            </>
          );
        },
      },
      {
        Header: i18n("actions"),
        className: "text-center align-middle snapshot-actions",
        Cell: (props: CellProps<SnapshotData>) => {
          return (
            <>
              <Link
                className="btn btn-primary btn-sm"
                to={resolvePath(props.row.original, asset)}
              >
                {i18n("snapshots.show")}
              </Link>
              {
                <IfUserIsAdmin>
                  <Button
                    size="sm"
                    color="outline-danger"
                    onClick={() => onRemoveClick(props.row.original)}
                  >
                    {i18n("remove")}
                  </Button>
                </IfUserIsAdmin>
              }
            </>
          );
        },
      },
    ],
    [asset, i18n, onRemoveClick]
  );

  return (
    <>
      <PromiseTrackingMask area="vocabulary-snapshots" />
      <RemoveSnapshotDialog
        snapshot={toRemove}
        onConfirm={onRemove}
        onCancel={() => setToRemove(null)}
      />
      <SnapshotsTable columns={columns} data={snapshots} />
    </>
  );
};

export default VocabularySnapshots;
