import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  HeaderGroup,
  Row,
  SortingState,
  Table,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import {
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Table as BootstrapTable } from "reactstrap";
import "./TanstackTable.scss";
import AlphaNumSortToggle from "../component/misc/table/AlphaNumSortToggle";
import classNames from "classnames";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import {
  QueryFunction,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { ResultPage } from "../model/ResultPage";

interface TanStackProps<T> extends Omit<TableOptions<T>, "instance" | "data"> {}

export type QueryFn = <T>(
  pageNumber: number,
  pageSize: number,
  sorting: SortingState,
  signal?: AbortSignal
) => Promise<ResultPage<T>>;

export interface TanstackTableProps<T> extends Partial<TanStackProps<T>> {
  columns: ColumnDef<T>[];
  queryFn: QueryFn;
  queryKey: QueryKey;
}

type TableQueryKey = readonly [...QueryKey, SortingState, number];

function measureElement() {
  // measure dynamic row height, except in firefox because it measures table border height incorrectly
  return typeof window !== "undefined" &&
    navigator.userAgent.indexOf("Firefox") === -1
    ? (element) => element?.getBoundingClientRect().height
    : undefined;
}

/**
 * Virtualized TanStack table with infinite scrolling
 *
 * @param props
 * @constructor
 * @see https://tanstack.com/table/v8/docs/framework/react/examples/virtualized-infinite-scrolling
 */
export const InfiniteTable = <T,>(props: TanstackTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 50; // TODO page size

  const queryFn: QueryFunction<ResultPage<T>, TableQueryKey> = useCallback(
    ({ queryKey, pageParam = 0, signal }) => {
      const [sorting, pageSize] = queryKey.slice(-2) as [SortingState, number];
      return props.queryFn(pageParam, pageSize, sorting, signal);
    },
    [props]
  );

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<
    ResultPage<T>, // page data
    Error,
    ResultPage<T>, // data after select
    TableQueryKey
  >({
    queryKey: [
      // when key changes, the content is refetched
      ...props.queryKey,
      sorting,
      pageSize,
    ],
    queryFn,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
  });

  const flatData: T[] = useMemo(
    () => data?.pages?.flatMap((page) => page.pageContent) ?? [],
    [data]
  );
  const totalDBRowCount = data?.pages?.[0]?.totalCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
    ...props,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: table.getRowModel().rows.length,
    estimateSize: () => 33, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    measureElement: measureElement(),
    overscan: 5,
  });

  const { rows } = table.getRowModel();

  const onSortingChange = useCallback(
    (updater) => {
      setSorting(updater);
      if (rows.length) {
        rowVirtualizer.scrollToIndex?.(0);
      }
    },
    [rowVirtualizer, rows.length]
  );

  table.setOptions((prev) => ({
    ...prev,
    onSortingChange,
  }));

  const onContainerScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => fetchMoreOnBottomReached(e.currentTarget),
    [fetchMoreOnBottomReached]
  );

  if (isLoading) {
    return <>Loading...</>; // TODO loading
  }

  return (
    <div
      className={"tanstack-table"}
      ref={tableContainerRef}
      onScroll={onContainerScroll}
    >
      <BootstrapTable>
        <TableHead table={table} />
        <TableBody table={table} rowVirtualizer={rowVirtualizer} />
      </BootstrapTable>
    </div>
  );
};

interface HasTable<T> {
  table: Table<T>;
}

const TableHead = <T,>({ table }: HasTable<T>) => {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <HeadRow<T> headerGroup={headerGroup} key={headerGroup.id} />
      ))}
    </thead>
  );
};

const HeadRow = <T,>({ headerGroup }: { headerGroup: HeaderGroup<T> }) => {
  return (
    <tr>
      {headerGroup.headers.map((header) => {
        return (
          <th
            key={header.id}
            style={{
              width: header.getSize(),
            }}
          >
            <div
              className={classNames({
                "cursor-pointer select-none": header.column.getCanSort(),
              })}
              onClick={header.column.getToggleSortingHandler()}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanSort() && (
                <AlphaNumSortToggle
                  isSorted={header.column.getIsSorted() != false}
                  desc={header.column.getIsSorted() === "desc"}
                />
              )}
            </div>
          </th>
        );
      })}
    </tr>
  );
};

interface TableBodyProps<T> extends HasTable<T> {
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

const TableBody = <T,>({ table, rowVirtualizer }: TableBodyProps<T>) => {
  const { rows } = table.getRowModel();
  return (
    <tbody
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<T>;
        return (
          <tr
            data-index={virtualRow.index} //needed for dynamic row height measurement
            ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
            key={row.id}
            style={{
              transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
            }}
          >
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
