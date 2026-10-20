import {
  CollectionMember,
  getMemberLabel,
  isMemberCollection,
  SkosCollectionDto,
} from "../../model/Collection";
import {
  FunctionComponent,
  KeyboardEvent,
  MutableRefObject,
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ColumnDef, Row, SortingState, Table } from "@tanstack/react-table";
import { InfiniteTable, QueryFn } from "../../util/InfiniteTable";
import { ResultPage } from "../../model/ResultPage";
import { FormattedMessage } from "react-intl";
import { loadCollectionMembers } from "../../action/AsyncCollectionActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import "./CollectionsList.scss";
import { CollectionIcon } from "./CollectionIcon";
import { Input } from "reactstrap";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Virtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { useRowDragReorder } from "../hook/useRowDragReorder";

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  shortLocale: string;
}

const DRAG_ICON_SIZE = "24px";
// how long the moved row stays highlighted before it fades out, in milliseconds
const MOVED_ROW_HIGHLIGHT_DURATION = 1500;

const DragReorderIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={DRAG_ICON_SIZE}
    height={DRAG_ICON_SIZE}
    fill="none"
    stroke="grey"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 5l3-3 3 3" /> {/* arrow up */}
    <path d="M5 10h14" />
    <path d="M5 14h14" />
    <path d="M9 19l3 3 3-3" /> {/* arrow down */}
  </svg>
);

const DragHandle: FunctionComponent<{
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
}> = ({ onPointerDown }) => (
  <div className={"drag-handle"} onPointerDown={onPointerDown}>
    <DragReorderIcon />
  </div>
);

type IndexChangeCallback = (
  row: Row<CollectionMember>,
  newIndex: number
) => void;

/**
 * Moves the item at fromIndex to toIndex while preserving the size of each page
 */
function moveInPages<T>(
  data: InfiniteData<ResultPage<T>>,
  fromIndex: number,
  toIndex: number
): InfiniteData<ResultPage<T>> {
  const flat = data.pages.flatMap((page) => page.pageContent);
  const [moved] = flat.splice(fromIndex, 1);
  flat.splice(toIndex, 0, moved);
  let offset = 0;
  return {
    ...data,
    pages: data.pages.map((page) => {
      const pageContent = flat.slice(offset, offset + page.pageContent.length);
      offset += page.pageContent.length;
      return { ...page, pageContent };
    }),
  };
}

/**
 * Displays position of the row and allows moving the row by changing it
 */
const OrderInput: FunctionComponent<{
  row: Row<CollectionMember>;
  onIndexChange: IndexChangeCallback;
}> = ({ row, onIndexChange }) => {
  const [order, setOrder] = useState(String(row.index + 1));
  // the row may be moved by another row's change
  useEffect(() => setOrder(String(row.index + 1)), [row.index]);

  const commit = useCallback(() => {
    const newIndex = Number.parseInt(order) - 1;
    if (Number.isNaN(newIndex) || newIndex === row.index) {
      setOrder(String(row.index + 1));
      return;
    }
    onIndexChange(row, newIndex);
  }, [onIndexChange, order, row]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setOrder(String(row.index + 1));
      }
    },
    [commit, row.index]
  );

  return (
    <Input
      className={"order"}
      type={"text"}
      inputMode={"numeric"}
      value={order}
      onChange={(e) => setOrder(e.currentTarget.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
};

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale, collection }: CollectionMembersListProps) => {
  const dispatch: ThunkDispatch = useDispatch();
  const tableInstanceRef: MutableRefObject<Table<CollectionMember> | null> =
    useRef(null);
  const rowVirtualizerRef: MutableRefObject<Virtualizer<
    HTMLDivElement,
    HTMLTableRowElement
  > | null> = useRef(null);

  const isOrdered = collection?.isOrdered() ?? false;

  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["collection-members-list", collection?.iri],
    [collection?.iri]
  );

  // a new object on every move, so moving the same row again restarts the highlight
  const [movedRow, setMovedRow] = useState<{ id: string } | null>(null);
  useEffect(() => {
    if (!movedRow) {
      return;
    }
    const timeout = setTimeout(
      () => setMovedRow(null),
      MOVED_ROW_HIGHLIGHT_DURATION
    );
    return () => clearTimeout(timeout);
  }, [movedRow]);

  const onIndexChange: IndexChangeCallback = useCallback(
    (row, newIndex) => {
      setMovedRow({ id: row.id });
      const loadedCount =
        tableInstanceRef.current?.getRowModel().rows.length ?? 0;
      const isTargetLoaded = newIndex < loadedCount;
      if (isTargetLoaded) {
        // InfiniteTable appends sorting and page size to the key, so the update is applied by key prefix
        queryClient.setQueriesData<InfiniteData<ResultPage<CollectionMember>>>(
          { queryKey },
          (data) => data && moveInPages(data, row.index, newIndex)
        );
        // the number of rows is unchanged, so the virtualizer can scroll to the target right away
        rowVirtualizerRef.current?.scrollToIndex(newIndex, {
          align: "auto",
          behavior: "smooth",
        });
      }
      // TODO persist the new member position
      Promise.resolve()
        .then(() =>
          isTargetLoaded
            ? undefined
            : queryClient.invalidateQueries({ queryKey })
        )
        .catch(() => queryClient.invalidateQueries({ queryKey }));
    },
    [queryClient, queryKey]
  );

  const { startDrag, getRowClassName: getDragRowClassName } = useRowDragReorder(
    tableInstanceRef,
    rowVirtualizerRef,
    onIndexChange
  );

  const getRowClassName = useCallback(
    (row: Row<CollectionMember>) =>
      classNames(getDragRowClassName(row), {
        "row-moved": row.id === movedRow?.id,
      }),
    [getDragRowClassName, movedRow]
  );

  const columns = useMemo<ColumnDef<CollectionMember>[]>(
    () => [
      ...(isOrdered // only when collection is ordered
        ? [
            {
              id: "order",
              cell: ({ row }) => (
                <OrderInput row={row} onIndexChange={onIndexChange} />
              ),
              enableSorting: false,
            },
            {
              id: "drag",
              cell: ({ row }) => (
                <DragHandle onPointerDown={(e) => startDrag(row, e)} />
              ),
              enableSorting: false,
            },
          ]
        : []),
      {
        id: "label",
        accessorFn: (member) => getMemberLabel(member, shortLocale),
        cell: ({ row, renderValue }) => (
          <>
            {isMemberCollection(row.original) && (
              <CollectionIcon id={"collection-member-" + row.id} />
            )}
            {renderValue()}
          </>
        ),
        enableSorting: false,
      },
    ],
    [isOrdered, onIndexChange, shortLocale, startDrag]
  );

  const queryFn: QueryFn<CollectionMember> = useCallback(
    (
      pageNumber: number,
      pageSize: number,
      sorting: SortingState,
      signal?: AbortSignal
    ): Promise<ResultPage<CollectionMember>> => {
      if (collection == null) {
        return Promise.resolve({ totalCount: 0, pageContent: [] });
      }
      return dispatch(
        loadCollectionMembers(collection, pageNumber, pageSize, signal)
      );
    },
    [collection, dispatch]
  );

  return (
    <>
      <FormattedMessage tagName={"h3"} id={"collection.members"} />
      <InfiniteTable<CollectionMember>
        {...{ columns, queryFn, queryKey }}
        getRowId={(member) => member.iri}
        disableHeader={true}
        className={classNames("skos-collections-list", {
          "first-row-icon second-row-icon second-row-drag": isOrdered,
        })}
        tableInstanceRef={tableInstanceRef}
        rowVirtualizerRef={rowVirtualizerRef}
        getRowClassName={isOrdered ? getRowClassName : undefined}
      />
    </>
  );
};
