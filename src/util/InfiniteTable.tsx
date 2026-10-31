import {
  ColumnDef as TanStackColumnDef,
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
  MutableRefObject,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Table as BootstrapTable } from "reactstrap";
import "./InfiniteTable.scss";
import AlphaNumSortToggle from "../component/misc/table/AlphaNumSortToggle";
import classNames from "classnames";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import {
  QueryFunction,
  QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { ResultPage } from "../model/ResultPage";
import If from "../component/misc/If";
import { useI18n } from "../component/hook/useI18n";
import ContainerMask from "../component/misc/ContainerMask";
import { PageRequest } from "./Types";

interface TanStackProps<T> extends Omit<TableOptions<T>, "instance" | "data"> {}

export type QueryFn<T> = (
  pageRequest: PageRequest,
  sorting: SortingState,
  signal?: AbortSignal
) => Promise<ResultPage<T>>;

export interface ColumnMeta {
  /**
   * Class name applied to the column cell
   */
  className?: string;
}

export type ColumnDef<T> = TanStackColumnDef<T> & {
  meta?: ColumnMeta;
};

export interface InfiniteTableHandle {}

export interface TanstackTableProps<T> extends Partial<TanStackProps<T>> {
  /**
   * Column definitions of the table
   */
  columns: ColumnDef<T>[];
  /**
   * Function used to fetch pages with data
   */
  queryFn: QueryFn<T>;
  /**
   * Used as part of the final query key.
   */
  queryKey: QueryKey;
  /**
   * classes applied to the div wrapping the table
   */
  className?: string;
  /**
   * Reference to the TanStack table instance
   */
  tableInstanceRef?: MutableRefObject<Table<T> | null>;
  /**
   * Reference to the TanStack virtualizer
   */
  rowVirtualizerRef?: MutableRefObject<Virtualizer<
    HTMLDivElement,
    HTMLTableRowElement
  > | null>;
  /**
   * Size of the page that should be fetched from server. Default: 50
   */
  pageSize?: number;
  /** classes applied to the row */
  getRowClassName?: (row: Row<T>) => string | undefined;
  /**
   * Text to show when there are no data
   */
  emptyText?: string;
}

type TableQueryKey = readonly [...QueryKey, SortingState, number];

/**
 * @see https://github.com/TanStack/table/blob/50f2133167f9b1f96c0908c4c9dfc9dab89ed7f7/examples/react/virtualized-infinite-scrolling/src/main.tsx#L162
 */
function getMeasureElementFunction() {
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
 * @see https://github.com/TanStack/table/blob/v8/examples/react/virtualized-infinite-scrolling/src/main.tsx
 */
export const InfiniteTable = <T,>(props: TanstackTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = props.pageSize ?? 50;

  // wrapped query function from props passing sorting and page size state from the internal query key
  const queryFn: QueryFunction<ResultPage<T>, TableQueryKey> = useCallback(
    ({ queryKey, pageParam = 0, signal }) => {
      const [sorting, pageSize] = queryKey.slice(-2) as [SortingState, number];
      return props.queryFn(
        { page: pageParam, size: pageSize },
        sorting,
        signal
      );
    },
    [props]
  );

  const { data, fetchNextPage, isFetching, isFetchingNextPage, isLoading } =
    useInfiniteQuery<
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
      getNextPageParam: (lastGroup, groups) =>
        lastGroup.totalCount === groups.length ? undefined : groups.length,
      refetchOnWindowFocus: false,
    });

  // TanStack caches values computed by column accessors in the row instances, which are recreated only when data change.
  // A new array is created when columns change, so filtering and sorting use the current accessors (e.g., locale-dependent labels).
  const flatData: T[] = useMemo(
    () => data?.pages?.flatMap((page) => page.pageContent) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, props.columns]
  );
  /// total count reported by the first page or 0
  const totalDBRowCount = data?.pages?.[0]?.totalCount ?? 0;
  const totalFetched = flatData.length;

  // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  // https://github.com/TanStack/table/blob/50f2133167f9b1f96c0908c4c9dfc9dab89ed7f7/examples/react/virtualized-infinite-scrolling/src/main.tsx#L108
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
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

  const table = useReactTable({
    data: flatData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...props,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: table.getRowModel().rows.length,
    estimateSize: () => 42, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    measureElement: getMeasureElementFunction(),
    overscan: 10,
  });

  const { rows } = table.getRowModel();
  const globalFilter = table.getState().globalFilter;

  // Fetch more data when the rows do not fill the container, as the scroll event cannot fire then.
  // Runs on mount, after each fetch and when the displayed rows change (e.g. by filtering),
  // so pages keep loading until the container is filled or all data are fetched.
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached, rows.length, globalFilter]);

  const onSortingChange = useCallback(
    (updater) => {
      setSorting(updater);
      if (rows.length) {
        // reset scroll when sorting changes
        rowVirtualizer.scrollToIndex?.(0);
      }
    },
    [rowVirtualizer, rows.length]
  );

  // since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange,
  }));

  const onContainerScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => fetchMoreOnBottomReached(e.currentTarget),
    [fetchMoreOnBottomReached]
  );

  if (props.tableInstanceRef) {
    props.tableInstanceRef.current = table;
  }
  if (props.rowVirtualizerRef) {
    props.rowVirtualizerRef.current = rowVirtualizer;
  }

  return (
    <>
      <div
        className={classNames("tanstack-table", props.className)}
        ref={tableContainerRef}
        onScroll={onContainerScroll}
      >
        <BootstrapTable>
          <TableHead table={table} />
          <TableBody
            table={table}
            rowVirtualizer={rowVirtualizer}
            getRowClassName={props.getRowClassName}
          />
          <TableFoot
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            table={table}
            emptyText={props.emptyText}
          />
        </BootstrapTable>
      </div>
      <If expression={isLoading}>
        <ContainerMask />
      </If>
    </>
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
            <div>
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanSort() && (
                <AlphaNumSortToggle
                  onClick={header.column.getToggleSortingHandler()}
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
  getRowClassName?: (row: Row<T>) => string | undefined;
}

const TableBody = <T,>({
  table,
  rowVirtualizer,
  getRowClassName,
}: TableBodyProps<T>) => {
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
            className={getRowClassName?.(row)}
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
                  className={cell.column.columnDef.meta?.className}
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

interface TableFootProps<T> extends HasTable<T> {
  isFetchingNextPage: boolean;
  isLoading: boolean;
  emptyText?: string;
}

const TableFoot = <T,>({
  isFetchingNextPage,
  isLoading,
  table,
  emptyText,
}: TableFootProps<T>) => {
  const { i18n } = useI18n();
  return (
    <tfoot>
      <If
        expression={
          table.getRowCount() === 0 && !isFetchingNextPage && !isLoading
        }
      >
        <tr>
          <td colSpan={table.getVisibleLeafColumns().length}>
            <span>{emptyText ?? ""}</span>
          </td>
        </tr>
      </If>
      <If expression={isFetchingNextPage}>
        <tr>
          <td colSpan={table.getVisibleLeafColumns().length}>
            {i18n("select.loading")}
          </td>
        </tr>
      </If>
    </tfoot>
  );
};
