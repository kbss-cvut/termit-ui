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
import { CellProps, Column, Row, usePagination, useTable } from "react-table";
import { FormattedDate, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import { Button, Table } from "reactstrap";
import Pagination from "../../misc/table/Pagination";
import Routes from "../../../util/Routes";

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
  const onRemove = React.useCallback(
    (snapshot: SnapshotData) => {
      dispatch(removeSnapshot(VocabularyUtils.create(snapshot.iri)));
    },
    [dispatch]
  );

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
                <Button
                  size="sm"
                  color="outline-danger"
                  onClick={() => onRemove(props.row.original)}
                >
                  {i18n("remove")}
                </Button>
              }
            </>
          );
        },
      },
    ],
    [asset, i18n, onRemove]
  );
  const tableInstance = useTable<SnapshotData>(
    {
      columns,
      data: snapshots,
    } as any,
    usePagination
  );
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow } =
    tableInstance;
  const page: Row<SnapshotData>[] = (tableInstance as any).page;

  if (snapshots.length === 0) {
    return (
      <div
        id="snapshots-empty-notice"
        className="additional-metadata-container italics"
      >
        {i18n("snapshots.empty")}
      </div>
    );
  }

  return (
    <div className="additional-metadata-container">
      <Table {...getTableProps()} striped={true} responsive={true}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <th
                    {...column.getHeaderProps([
                      { className: (column as any).className },
                    ])}
                  >
                    {column.render("Header")}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps([
                      { className: (cell.column as any).className },
                    ])}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        pagingProps={tableInstance as any}
        pagingState={tableInstance.state as any}
        allowSizeChange={true}
      />
    </div>
  );
};

export default VocabularySnapshots;
