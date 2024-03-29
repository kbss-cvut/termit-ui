import * as React from "react";
import User from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import TextBasedFilter, {
  textContainsFilter,
} from "../../misc/table/TextBasedFilter";
import Table from "../../misc/table/Table";
import UserRoles from "./UserRoles";
import UserActionsButtons, { UserActions } from "./UserActionsButtons";
import UserStatusInfo, { resolveStatus } from "./UserStatusInfo";
import classNames from "classnames";

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
  const columns: Column<User>[] = React.useMemo(
    () => [
      {
        Header: "",
        accessor: "iri",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => (
          <>{React.createElement(resolveStatus(row.original).icon)}</>
        ),
        className: "align-middle",
      },
      {
        Header: i18n("administration.users.name"),
        accessor: "fullName",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({ row }) => <>{row.original.fullName}</>,
        className: "align-middle",
      },
      {
        Header: i18n("administration.users.username"),
        accessor: "username",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({ row }) => <>{row.original.username}</>,
        className: "align-middle",
      },
      {
        Header: i18n("administration.users.status"),
        accessor: "isActive",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => <UserStatusInfo user={row.original} />,
        className: "align-middle",
      },
      {
        Header: i18n("administration.users.role"),
        accessor: "types",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row }) => <UserRoles user={row.original} />,
        className: "align-middle",
      },
      {
        Header: i18n("actions"),
        id: "actions",
        headerClassName: "text-center align-top",
        disableFilters: true,
        disableSortBy: true,
        // @ts-ignore
        Cell: ({ row }) =>
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
        className: "align-middle table-row-actions",
      },
    ],
    [i18n, disable, enable, unlock, changeRole, currentUser, readOnly]
  );
  const filterTypes = React.useMemo(() => ({ text: textContainsFilter }), []);
  const tableInstance = useTable<User>(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        sortBy: [
          {
            id: "username",
            desc: false,
          },
        ],
      },
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
          bold: meta.row.original.iri === currentUser.iri,
        }),
        title:
          meta.row.original.iri === currentUser.iri
            ? i18n("administration.users.you")
            : undefined,
        ...props,
      })}
    />
  );
};

export default UsersTable;
