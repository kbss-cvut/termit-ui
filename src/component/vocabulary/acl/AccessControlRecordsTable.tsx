import React from "react";
import {
  AccessControlList,
  AccessControlRecord,
} from "../../../model/AccessControlList";
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
import { Badge, Button } from "reactstrap";
import Table from "../../misc/table/Table";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import User, { UserData } from "../../../model/User";
import UserRole from "../../../model/UserRole";
import { getLocalized } from "../../../model/MultilingualString";
import AccessLevelBadge from "./AccessLevelBadge";

interface AccessRecordsTableProps {
  acl: AccessControlList;
  onEdit: (record: AccessControlRecord<any>) => void;
  onRemove: (record: AccessControlRecord<any>) => void;
}

function renderHolder(
  record: AccessControlRecord<any>,
  i18n: (id?: string) => string,
  locale: string
) {
  const types = Utils.sanitizeArray(record.holder.types);
  if (types.indexOf(VocabularyUtils.USER) !== -1) {
    return (
      <>
        <Badge className="acl-holder-type-badge mr-1 align-text-bottom">
          {i18n("type.user")}
        </Badge>
        {new User(record.holder as UserData).fullName}
      </>
    );
  } else if (types.indexOf(VocabularyUtils.USER_GROUP) !== -1) {
    return (
      <>
        <Badge className="acl-holder-type-badge mr-1 align-text-bottom">
          {i18n("type.usergroup")}
        </Badge>
        {(record.holder as UserGroup).label}
      </>
    );
  } else {
    return (
      <>
        <Badge className="acl-holder-type-badge mr-1 align-text-bottom">
          {i18n("type.userrole")}
        </Badge>
        {getLocalized((record.holder as UserRole).label, locale)}
      </>
    );
  }
}

const AccessControlRecordsTable: React.FC<AccessRecordsTableProps> = ({
  acl,
  onEdit,
  onRemove,
}) => {
  const { i18n, locale } = useI18n();
  const data = React.useMemo(() => acl.records, [acl]);
  const columns: Column<AccessControlRecord<any>>[] = React.useMemo(
    () => [
      {
        Header: i18n("vocabulary.acl.record.holder"),
        accessor: "holder",
        className: "align-middle",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => renderHolder(row.original, i18n, locale),
      },
      {
        Header: i18n("vocabulary.acl.record.level"),
        accessor: "level",
        className: "align-middle",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => <AccessLevelBadge level={row.original.level} />,
      },
      {
        Header: i18n("actions"),
        id: "actions",
        headerClassName: "text-center align-top",
        disableFilters: true,
        disableSortBy: true,
        // @ts-ignore
        Cell: ({ row }) => (
          <>
            <Button
              key="record-delete"
              size="sm"
              color="primary"
              onClick={() => onEdit(row.original)}
            >
              {i18n("edit")}
            </Button>
            <Button
              key="group-delete"
              size="sm"
              onClick={() => onRemove(row.original)}
              color="outline-danger"
            >
              {i18n("remove")}
            </Button>
          </>
        ),
        className: "table-row-actions text-center",
      },
    ],
    [i18n, locale, onEdit, onRemove]
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
  return <Table instance={tableInstance} />;
};

export default AccessControlRecordsTable;
