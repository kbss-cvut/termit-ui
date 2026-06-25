import React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import SnapshotData from "../../model/Snapshot";
import Table from "../misc/table/Table";
import { useI18n } from "../hook/useI18n";
import "./SnapshotsTable.scss";

interface SnapshotsTableProps {
  columns: ColumnDef<SnapshotData>[];
  data: SnapshotData[];
}

const SnapshotsTable: React.FC<SnapshotsTableProps> = ({ columns, data }) => {
  const { i18n } = useI18n();
  const tableInstance = useReactTable<SnapshotData>({
    columns,
    data,
    defaultColumn: { sortingFn: "alphanumeric" },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
      <Table instance={tableInstance} />
    </div>
  );
};

export default SnapshotsTable;
