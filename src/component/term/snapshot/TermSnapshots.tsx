import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CellProps, Column, Row, usePagination, useTable } from "react-table";
import { Link } from "react-router-dom";
import { Table } from "reactstrap";
import { FormattedDate, FormattedTime } from "react-intl";
import { useI18n } from "../../hook/useI18n";
import { ThunkDispatch } from "../../../util/Types";
import SnapshotData from "../../../model/Snapshot";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Routes from "../../../util/Routes";
import TermItState from "../../../model/TermItState";
import { loadTermSnapshots } from "../../../action/AsyncTermActions";
import NotificationType from "../../../model/NotificationType";
import { consumeNotification } from "../../../action/SyncActions";
import Pagination from "../../misc/table/Pagination";

interface TermSnapshotsProps {
  asset: Term;
}

function resolvePath(snapshot: SnapshotData, asset: Term) {
  const iri = VocabularyUtils.create(snapshot.iri);
  const vocabularyIri = VocabularyUtils.create(asset.vocabulary!.iri!);
  return Routes.vocabularyTermSnapshotDetail.link(
    {
      name: vocabularyIri.fragment,
      termName: VocabularyUtils.create(asset.iri).fragment,
      timestamp: iri.fragment,
    },
    { namespace: vocabularyIri.namespace }
  );
}

const TermSnapshots: React.FC<TermSnapshotsProps> = ({ asset }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const notifications = useSelector(
    (state: TermItState) => state.notifications
  );
  useEffect(() => {
    dispatch(loadTermSnapshots(VocabularyUtils.create(asset.iri))).then(
      (data: SnapshotData[]) => setSnapshots(data)
    );
  }, [asset.iri, dispatch, setSnapshots]);
  useEffect(() => {
    const event = notifications.find(
      (n) => n.source.type === NotificationType.SNAPSHOT_COUNT_CHANGED
    );
    if (event) {
      dispatch(consumeNotification(event));
      dispatch(loadTermSnapshots(VocabularyUtils.create(asset.iri))).then(
        (data) => setSnapshots(data)
      );
    }
  }, [asset.iri, dispatch, notifications, setSnapshots]);

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
            </>
          );
        },
      },
    ],
    [asset, i18n]
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

export default TermSnapshots;
