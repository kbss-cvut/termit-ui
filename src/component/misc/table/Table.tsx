import React from "react";
import {
  Row,
  RowPropGetter,
  TableInstance,
  UseFiltersColumnProps,
  UseSortByColumnProps,
} from "react-table";
import { Table as ReactstrapTable } from "reactstrap";
import AlphaNumSortToggle from "./AlphaNumSortToggle";
import Pagination from "./Pagination";
import "./Table.scss";

interface TableProps<T extends Object> {
  instance: TableInstance<T>;
  // Allows overriding row props. Do not forget to include the provided row props
  overrideRowProps?: RowPropGetter<T>;
}

const Table: React.FC<TableProps<any>> = ({ instance, overrideRowProps }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow } =
    instance;
  const page: Row<any>[] = (instance as any).page;

  return (
    <>
      <ReactstrapTable {...getTableProps()} striped={true} responsive={true}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                const col: UseSortByColumnProps<any> &
                  UseFiltersColumnProps<any> = column as any;
                return (
                  <th
                    {...column.getHeaderProps([
                      {
                        className: (column as any).headerClassName
                          ? (column as any).headerClassName
                          : "align-top",
                      },
                    ])}
                  >
                    {column.render("Header")}
                    {col.canSort && (
                      <AlphaNumSortToggle
                        sortProps={column.getHeaderProps(
                          col.getSortByToggleProps()
                        )}
                        desc={col.isSortedDesc}
                        isSorted={col.isSorted}
                      />
                    )}
                    {col.canFilter && (
                      <div className="filter-wrapper">
                        {column.render("Filter")}
                      </div>
                    )}
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
              <tr {...row.getRowProps(overrideRowProps)}>
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
      </ReactstrapTable>
      <Pagination
        pagingProps={instance as any}
        pagingState={instance.state as any}
        allowSizeChange={true}
      />
    </>
  );
};

export default Table;
