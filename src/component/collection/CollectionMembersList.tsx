import {
  CollectionMember,
  isOrderedCollection,
  SkosCollectionDto,
} from "../../model/Collection";
import {
  FunctionComponent,
  MutableRefObject,
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Row, Table } from "@tanstack/react-table";
import { ColumnDef, InfiniteTable, QueryFn } from "../../util/InfiniteTable";
import { ResultPage } from "../../model/ResultPage";
import {
  loadCollectionMembers,
  updateCollectionMemberPosition,
} from "../../action/AsyncCollectionActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Virtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { useRowDragReorder } from "../hook/useRowDragReorder";
import { DragHandle } from "./DragHandle";
import { IndexChangeCallback, MemberOrderInput } from "./MemberOrderInput";

import "./CollectionsList.scss";
import { moveInPages } from "./CollectionUtils";
import { isVocabularyActionAuthorized } from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import Vocabulary from "../../model/Vocabulary";
import AccessLevel from "../../model/acl/AccessLevel";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { useI18n } from "../hook/useI18n";
import If from "../misc/If";
import { CollectionIcon } from "./CollectionIcon";
import { CollectionLink } from "./CollectionLink";
import TermLink from "../term/TermLink";
import { FaTrashAlt } from "react-icons/fa";
import { Button } from "reactstrap";
import {
  RemoveCollectionMemberDialog,
  RemoveCollectionMemberDialogHandle,
} from "./RemoveCollectionMemberDialog";

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  vocabulary: Vocabulary | null;
  shortLocale: string;
}

// how long the moved row stays highlighted before it fades out, in milliseconds
const MOVED_ROW_HIGHLIGHT_DURATION = 1500;

function getMoveArea(id: string) {
  return "collection-member-moved-row-" + id;
}

type RemoveCb = (member: CollectionMember) => void;

const RemoveButton = ({
  row,
  onRemove,
}: {
  row: Row<CollectionMember>;
  onRemove: RemoveCb;
}) => {
  const { i18n } = useI18n();
  return (
    <Button
      id="collection-detail-remove"
      size="sm"
      color="outline-danger"
      title={i18n("collection.members.remove.title")}
      onClick={() => onRemove(row.original)}
    >
      <FaTrashAlt />
      &nbsp;{i18n("remove")}
    </Button>
  );
};

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale, collection, vocabulary }: CollectionMembersListProps) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const tableInstanceRef: MutableRefObject<Table<CollectionMember> | null> =
    useRef(null);
  const rowVirtualizerRef: MutableRefObject<Virtualizer<
    HTMLDivElement,
    HTMLTableRowElement
  > | null> = useRef(null);
  const removeMemberDialogRef =
    useRef<RemoveCollectionMemberDialogHandle>(null);

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
  const [movedRow, setMovedRow] = useState<{
    id: string;
  } | null>(null);
  const pendingMove = useRef<{ id: string } | null>(null);

  useEffect(() => {
    if (!movedRow || pendingMove.current) {
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
      if (collection == null) {
        return;
      }

      const newMovedRow = { id: row.id };
      setMovedRow(newMovedRow);
      pendingMove.current = newMovedRow;

      const loadedCount =
        tableInstanceRef.current?.getRowModel().rows.length ?? 0;
      const isTargetLoaded = newIndex < loadedCount;
      const originalIndex = row.index;
      if (isTargetLoaded) {
        // setting for all queries matching the partial query key
        queryClient.setQueriesData<InfiniteData<ResultPage<CollectionMember>>>(
          { queryKey },
          (data) => data && moveInPages(data, originalIndex, newIndex)
        );
        rowVirtualizerRef.current?.scrollToIndex(newIndex, {
          align: "auto",
          behavior: "smooth",
        });
      }

      trackPromise(
        dispatch(
          updateCollectionMemberPosition(
            collection,
            row.original.iri,
            originalIndex,
            newIndex
          )
        ),
        getMoveArea(row.id)
      )
        // refresh data
        .then((action) => {
          if (action.status !== AsyncActionStatus.SUCCESS || !isTargetLoaded) {
            queryClient.invalidateQueries({ queryKey });
          }
        })
        // start the highlight fade out, unless another move replaced it meanwhile
        .finally(() => {
          pendingMove.current = null;
          setMovedRow({ ...newMovedRow });
        });
    },
    [collection, dispatch, queryClient, queryKey]
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

  const onDrag = useCallback(
    (row: Row<CollectionMember>, e: PointerEvent<HTMLDivElement>) => {
      if (pendingMove.current == null) {
        startDrag(row, e);
      }
    },
    [startDrag]
  );

  const onMemberRemoved = useCallback(() => {
    queryClient.invalidateQueries<InfiniteData<ResultPage<CollectionMember>>>({
      queryKey,
    });
  }, [queryClient, queryKey]);

  const onRemove: RemoveCb = useCallback(
    (member) => removeMemberDialogRef.current?.open(member),
    []
  );

  const columns = useMemo<ColumnDef<CollectionMember>[]>(
    () => [
      ...(isOrdered && canModify
        ? [
            {
              id: "order",
              meta: {
                className: "icon-column",
              },
              cell: ({ row }) => (
                <MemberOrderInput row={row} onIndexChange={onIndexChange} />
              ),
              enableSorting: false,
            },
            {
              id: "drag",
              meta: {
                className: "icon-column",
              },
              cell: ({ row }) => (
                <DragHandle onPointerDown={(e) => onDrag(row, e)} />
              ),
              enableSorting: false,
            },
            {
              id: "row-loading-mask",
              meta: {
                className: "max-width-0",
              },
              cell: ({ row }) => (
                <PromiseTrackingMask
                  area={getMoveArea(row.id)}
                  withoutText={true}
                />
              ),
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
      ...(canModify
        ? [
            {
              id: "remove",
              meta: {
                className: "end-buttons",
              },
              cell: ({ row }) => <RemoveButton {...{ row, onRemove }} />,
            },
          ]
        : []),
    ],
    [canModify, isOrdered, onDrag, onIndexChange, onRemove, shortLocale]
  );

  const queryFn: QueryFn<CollectionMember> = useCallback(
    (pageRequest, sorting, signal): Promise<ResultPage<CollectionMember>> => {
      if (collection == null) {
        return Promise.resolve({ totalCount: 0, pageContent: [] });
      }
      return dispatch(loadCollectionMembers(collection, pageRequest, signal));
    },
    [collection, dispatch]
  );

  useEffect(() => {
    // refresh data when collection instance is changed
    queryClient.invalidateQueries({ queryKey });
  }, [collection, queryClient, queryKey]);

  return (
    <>
      <InfiniteTable<CollectionMember>
        {...{ columns, queryFn, queryKey }}
        getRowId={(member) => member.iri}
        className="skos-collections-list"
        tableInstanceRef={tableInstanceRef}
        rowVirtualizerRef={rowVirtualizerRef}
        getRowClassName={isOrdered ? getRowClassName : undefined}
        emptyText={i18n("collection.members.empty")}
      />
      {canModify && collection && (
        <RemoveCollectionMemberDialog
          ref={removeMemberDialogRef}
          collection={collection}
          onMemberRemoved={onMemberRemoved}
        />
      )}
    </>
  );
};
