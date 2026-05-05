import React from "react";
import UserGroup from "../../../model/UserGroup";
import { useI18n } from "../../hook/useI18n";
import User from "../../../model/User";
import { textContainsFilter } from "../../misc/table/TextBasedFilter";
import Table from "../../misc/table/Table";
import { Button } from "reactstrap";
import Routes from "../../../util/Routes";
import { Link } from "react-router-dom";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
  const columns: ColumnDef<UserGroup>[] = React.useMemo<ColumnDef<UserGroup>[]>(
    () => [
      {
        header: i18n("asset.label"),
        accessorKey: "label",
        filterFn: textContainsFilter,
      },
      {
        header: i18n("administration.groups.members"),
        accessorKey: "members",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <ul>
            {row.original.members.map((m) => (
              <li key={m.iri}>{new User(m).fullName}</li>
            ))}
          </ul>
        ),
      },
      {
        header: i18n("actions"),
        id: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const iri = row.original.iri;
          return (
            <>
              {iri && (
                <Link
                  to={Routes.editUserGroup.link({
                    name: VocabularyUtils.create(iri).fragment,
                  })}
                  className="btn btn-primary btn-sm"
                >
                  {i18n("edit")}
                </Link>
              )}
              <Button
                key="group-delete"
                size="sm"
                onClick={() => onDelete(row.original)}
                color="outline-danger"
              >
                {i18n("remove")}
              </Button>
            </>
          );
        },
        meta: {
          headerClassName: "text-center align-top",
          className: "table-row-actions",
        },
      },
    ],
    [i18n, onDelete]
  );
  const tableInstance = useReactTable<UserGroup>({
    columns,
    data,
    initialState: {
      sorting: [{ id: "label", desc: false }],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return <Table instance={tableInstance} />;
};

export default UserGroupsTable;
