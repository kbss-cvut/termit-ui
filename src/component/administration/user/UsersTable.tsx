import * as React from "react";
import User from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import { textContainsFilter } from "../../misc/table/TextBasedFilter";
import Table from "../../misc/table/Table";
import UserRoles from "./UserRoles";
import UserActionsButtons, { UserActions } from "./UserActionsButtons";
import UserStatusInfo, { resolveStatus } from "./UserStatusInfo";
import classNames from "classnames";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface UsersTableProps extends UserActions {
  users: User[];
  currentUser: User;
  readOnly?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = (props) => {
  const { users, currentUser, disable, enable, unlock, changeRole, readOnly } =
    props;
  const { i18n } = useI18n();
  const data = React.useMemo(() => users, [users]);
  const columns: ColumnDef<User>[] = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "",
        accessorKey: "iri",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <>{React.createElement(resolveStatus(row.original).icon)}</>
        ),
        meta: { className: "align-middle" },
      },
      {
        header: i18n("administration.users.name"),
        accessorKey: "fullName",
        filterFn: textContainsFilter,
        cell: ({ row }) => <>{row.original.fullName}</>,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("administration.users.username"),
        accessorKey: "username",
        filterFn: textContainsFilter,
        cell: ({ row }) => <>{row.original.username}</>,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("administration.users.status"),
        accessorKey: "isActive",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => <UserStatusInfo user={row.original} />,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("administration.users.role"),
        accessorKey: "types",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => <UserRoles user={row.original} />,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("actions"),
        id: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) =>
          !readOnly && (
            <UserActionsButtons
              user={row.original}
              currentUser={currentUser}
              disable={disable}
              enable={enable}
              unlock={unlock}
              changeRole={changeRole}
            />
          ),
        meta: {
          headerClassName: "text-center align-top",
          className: "align-middle table-row-actions",
        },
      },
    ],
    [i18n, disable, enable, unlock, changeRole, currentUser, readOnly]
  );

  const tableInstance = useReactTable<User>({
    columns,
    data,
    initialState: {
      sorting: [{ id: "username", desc: false }],
    },
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
          bold: row.original.iri === currentUser.iri,
        }),
        title:
          row.original.iri === currentUser.iri
            ? i18n("administration.users.you")
            : undefined,
      })}
    />
  );
};

export default UsersTable;
