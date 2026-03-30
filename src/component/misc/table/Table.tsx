import React from "react";
import { Table as ReactstrapTable } from "reactstrap";
import AlphaNumSortToggle from "./AlphaNumSortToggle";
import Pagination from "./Pagination";
import "./Table.scss";
import {
  flexRender,
  Row,
  RowData,
  Table as TanStackTable,
} from "@tanstack/react-table";
import TextBasedFilter from "./TextBasedFilter";

type RowOverride<TData extends RowData> = (
  row: Row<TData>
) => React.HTMLAttributes<HTMLTableRowElement>;

interface TableProps<TData extends RowData> {
  instance: TanStackTable<TData>;
  // Allows overriding row props. Do not forget to include the provided row props
  overrideRowProps?: RowOverride<TData>;
}

const Table = <TData extends RowData>({
  instance,
  overrideRowProps,
}: TableProps<TData>) => {
  const headerGroups = instance.getHeaderGroups();
  const rows = instance.getRowModel().rows;

  return (
    <>
      <ReactstrapTable striped={true} responsive={true}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const column = header.column;

                return (
                  <th
                    key={header.id}
                    className={
                      column.columnDef.meta?.headerClassName ?? "align-top"
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          column.columnDef.header,
                          header.getContext()
                        )}

                    {column.getCanSort() && (
                      <AlphaNumSortToggle
                        onClick={column.getToggleSortingHandler()}
                        isSorted={column.getIsSorted() !== false}
                        desc={column.getIsSorted() === "desc"}
                      />
                    )}

                    {column.getCanFilter() && (
                      <div className="filter-wrapper">
                        <TextBasedFilter
                          value={(column.getFilterValue() as string) ?? ""}
                          onChange={(value) => column.setFilterValue(value)}
                        />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map((row) => {
            const rowProps = overrideRowProps ? overrideRowProps(row) : {};
            return (
              <tr key={row.id} {...rowProps}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </ReactstrapTable>
      <Pagination table={instance} allowSizeChange={true} />
    </>
  );
};

export default Table;
