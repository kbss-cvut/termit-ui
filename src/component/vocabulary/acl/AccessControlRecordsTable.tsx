import React from "react";
import {
  AccessControlList,
  AccessControlRecordData,
} from "../../../model/acl/AccessControlList";
import { useI18n } from "../../hook/useI18n";
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import UserGroup from "../../../model/UserGroup";
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
  const columns: Column<AccessControlRecordData>[] = React.useMemo(
    () => [
      {
        Header: i18n("vocabulary.acl.record.holder"),
        accessor: "holder",
        className: "align-middle",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => <AccessHolder record={row.original} />,
      },
      {
        Header: i18n("vocabulary.acl.record.level"),
        accessor: "accessLevel",
        className: "align-middle",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => (
          <AccessLevelBadge level={row.original.accessLevel} />
        ),
      },
      {
        Header: i18n("actions"),
        id: "actions",
        headerClassName: "text-center align-top",
        disableFilters: true,
        disableSortBy: true,
        // @ts-ignore
        Cell: ({ row }) => (
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
        className: "table-row-actions text-left",
      },
    ],
    [currentUser, i18n, onEdit, onRemove]
  );
  const filterTypes = React.useMemo(() => ({ text: textContainsFilter }), []);
  const tableInstance = useTable<UserGroup>(
    {
      columns,
      data,
      filterTypes,
    } as any,
    useFilters,
    useSortBy,
    usePagination
  );
  return (
    <Table
      instance={tableInstance}
      overrideRowProps={(props, meta) => ({
        className: classNames({
          bold: isMine(meta.row.original, currentUser),
        }),
        title: isMine(meta.row.original, currentUser)
          ? i18n("administration.users.you")
          : undefined,
        ...props,
      })}
    />
  );
};

export default AccessControlRecordsTable;
