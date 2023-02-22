import React from "react";
import UserGroup from "../../../model/UserGroup";
import { useI18n } from "../../hook/useI18n";
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import User from "../../../model/User";
import TextBasedFilter, {
  textContainsFilter,
} from "../../misc/table/TextBasedFilter";
import Table from "../../misc/table/Table";
import { Button } from "reactstrap";
import Routes from "../../../util/Routes";
import { Link } from "react-router-dom";
import VocabularyUtils from "../../../util/VocabularyUtils";

interface UserGroupsTableProps {
  groups: UserGroup[];
  onDelete: (group: UserGroup) => void;
}

const UserGroupsTable: React.FC<UserGroupsTableProps> = ({
  groups,
  onDelete,
}) => {
  const { i18n } = useI18n();
  const data = React.useMemo(() => groups, [groups]);
  const columns: Column<UserGroup>[] = React.useMemo(
    () => [
      {
        Header: i18n("asset.label"),
        accessor: "label",
        Filter: TextBasedFilter,
        filter: "text",
      },
      {
        Header: i18n("administration.groups.members"),
        accessor: "members",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => (
          <ul>
            {row.original.members.map((m) => (
              <li key={m.iri}>{new User(m).fullName}</li>
            ))}
          </ul>
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
          <>
            <Link
              to={Routes.editUserGroup.link({
                name: VocabularyUtils.create(row.original.iri).fragment,
              })}
              className="btn btn-primary btn-sm"
            >
              {i18n("edit")}
            </Link>
            <Button
              key="group-delete"
              size="sm"
              onClick={() => onDelete(row.original)}
              color="outline-danger"
            >
              {i18n("remove")}
            </Button>
          </>
        ),
        className: "table-row-actions text-center",
      },
    ],
    [i18n, onDelete]
  );
  const filterTypes = React.useMemo(() => ({ text: textContainsFilter }), []);
  const tableInstance = useTable<UserGroup>(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        sortBy: [
          {
            id: "label",
            desc: false,
          },
        ],
      },
    } as any,
    useFilters,
    useSortBy,
    usePagination
  );
  return <Table instance={tableInstance} />;
};

export default UserGroupsTable;
