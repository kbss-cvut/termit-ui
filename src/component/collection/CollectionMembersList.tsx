import {
  CollectionMember,
  isOrderedCollection,
  SkosCollectionDto,
} from "../../model/Collection";
import {
  FunctionComponent,
  MutableRefObject,
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
import { CollectionIcon } from "./CollectionIcon";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Virtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { useRowDragReorder } from "../hook/useRowDragReorder";
import { DragHandle } from "./DragHandle";
import { IndexChangeCallback, MemberOrderInput } from "./MemberOrderInput";

import "./CollectionsList.scss";
import If from "../misc/If";
import TermLink from "../term/TermLink";
import { CollectionLink } from "./CollectionLink";
import { moveInPages } from "./CollectionUtils";
import { isVocabularyActionAuthorized } from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import Vocabulary from "../../model/Vocabulary";
import AccessLevel from "../../model/acl/AccessLevel";

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  vocabulary: Vocabulary | null;
  shortLocale: string;
}

// how long the moved row stays highlighted before it fades out, in milliseconds
const MOVED_ROW_HIGHLIGHT_DURATION = 1500;

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale, collection, vocabulary }: CollectionMembersListProps) => {
  const dispatch: ThunkDispatch = useDispatch();
  const tableInstanceRef: MutableRefObject<Table<CollectionMember> | null> =
    useRef(null);
  const rowVirtualizerRef: MutableRefObject<Virtualizer<
    HTMLDivElement,
    HTMLTableRowElement
  > | null> = useRef(null);

  const isOrdered = collection?.isOrdered() ?? false;
  const canModify =
    vocabulary &&
    isVocabularyActionAuthorized(vocabulary, AccessLevel.WRITE, "edit");

  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["collection-members-list", collection?.iri],
    [collection?.iri]
  );

  // The highlighted row that was moved.
  // A new object on every set, so moving the same row again restarts the highlight
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
        // setting for all queries matching the partial query key
        queryClient.setQueriesData<InfiniteData<ResultPage<CollectionMember>>>(
          { queryKey },
          (data) => data && moveInPages(data, row.index, newIndex)
        );
        rowVirtualizerRef.current?.scrollToIndex(newIndex, {
          align: "auto",
          behavior: "smooth",
        });
      }
      // TODO persist the new member position
      Promise.resolve()
        // refresh data
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
      ...(isOrdered && canModify
        ? [
            {
              id: "order",
              cell: ({ row }) => (
                <MemberOrderInput row={row} onIndexChange={onIndexChange} />
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
        cell: ({ row }) => {
          const isCollection = row.original.isCollection();
          return (
            <>
              <If expression={isCollection}>
                <CollectionIcon
                  id={"collection-member-collection-icon-" + row.index}
                  isOrdered={isOrderedCollection(row.original)}
                />
                <CollectionLink
                  collection={row.original}
                  shortLocale={shortLocale}
                />
              </If>
              <If expression={!isCollection}>
                <TermLink term={row.original} language={shortLocale} />
              </If>
            </>
          );
        },
        enableSorting: false,
      },
    ],
    [canModify, isOrdered, onIndexChange, shortLocale, startDrag]
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
          "first-row-icon second-row-icon": isOrdered,
        })}
        tableInstanceRef={tableInstanceRef}
        rowVirtualizerRef={rowVirtualizerRef}
        getRowClassName={isOrdered ? getRowClassName : undefined}
      />
    </>
  );
};
