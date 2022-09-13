import React from "react";
import { Column, Row, usePagination, useTable } from "react-table";
import SnapshotData from "../../model/Snapshot";
import { Table } from "reactstrap";
import Pagination from "../misc/table/Pagination";
import { useI18n } from "../hook/useI18n";
import "./SnapshotsTable.scss";

interface SnapshotsTableProps {
  columns: Column<SnapshotData>[];
  data: SnapshotData[];
}

const SnapshotsTable: React.FC<SnapshotsTableProps> = ({ columns, data }) => {
  const { i18n } = useI18n();
  const tableInstance = useTable<SnapshotData>(
    {
      columns,
      data,
    } as any,
    usePagination
  );
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow } =
    tableInstance;
  const page: Row<SnapshotData>[] = (tableInstance as any).page;

  if (data.length === 0) {
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

export default SnapshotsTable;
