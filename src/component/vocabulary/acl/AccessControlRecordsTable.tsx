import React from "react";
import {
  AccessControlList,
  AccessControlRecordData,
} from "../../../model/acl/AccessControlList";
import { useI18n } from "../../hook/useI18n";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { textContainsFilter } from "../../misc/table/TextBasedFilter";
import { Button } from "reactstrap";
import Table from "../../misc/table/Table";
import AccessLevelBadge from "./AccessLevelBadge";
import AccessHolder from "./AccessHolder";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import User from "../../../model/User";
import { IfAuthorized } from "react-authorization";
import classNames from "classnames";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Utils from "../../../util/Utils";

interface AccessRecordsTableProps {
  acl: AccessControlList;
  onEdit: (record: AccessControlRecordData) => void;
  onRemove: (record: AccessControlRecordData) => void;
}

function isMine(record: AccessControlRecordData, currentUser: User) {
  return record.holder.iri === currentUser.iri;
}

function isRemovable(record: AccessControlRecordData) {
  return (
    Utils.sanitizeArray(record.types).indexOf(
      VocabularyUtils.USERROLE_ACCESS_RECORD
    ) === -1
  );
}

const AccessControlRecordsTable: React.FC<AccessRecordsTableProps> = ({
  acl,
  onEdit,
  onRemove,
}) => {
  const { i18n } = useI18n();
  const currentUser = useSelector((state: TermItState) => state.user);
  const data = React.useMemo(() => acl.records, [acl]);
  const columns: ColumnDef<AccessControlRecordData>[] = React.useMemo(
    () => [
      {
        header: i18n("vocabulary.acl.record.holder"),
        accessorKey: "holder",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => <AccessHolder record={row.original} />,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("vocabulary.acl.record.level"),
        accessorKey: "accessLevel",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <AccessLevelBadge level={row.original.accessLevel} />
        ),
        meta: { className: "align-middle" },
      },
      {
        header: i18n("actions"),
        id: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <IfAuthorized isAuthorized={() => !isMine(row.original, currentUser)}>
            <Button
              key="record-delete"
              size="sm"
              color="primary"
              onClick={() => onEdit(row.original)}
            >
              {i18n("edit")}
            </Button>
            {isRemovable(row.original) && (
              <Button
                key="group-delete"
                size="sm"
                onClick={() => onRemove(row.original)}
                color="outline-danger"
              >
                {i18n("remove")}
              </Button>
            )}
          </IfAuthorized>
        ),
        meta: {
          headerClassName: "text-center align-top",
          className: "table-row-actions text-left",
        },
      },
    ],
    [currentUser, i18n, onEdit, onRemove]
  );

  const tableInstance = useReactTable<AccessControlRecordData>({
    columns,
    data,
    filterFns: { text: textContainsFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Table
      instance={tableInstance}
      overrideRowProps={(row) => ({
        className: classNames({
          bold: isMine(row.original, currentUser),
        }),
        title: isMine(row.original, currentUser)
          ? i18n("administration.users.you")
          : undefined,
      })}
    />
  );
};

export default AccessControlRecordsTable;
