import {
  CollectionMember,
  getMemberLabel,
  isMemberCollection,
  SkosCollectionDto,
} from "../../model/Collection";
import {
  FunctionComponent,
  MutableRefObject,
  useCallback,
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

export interface CollectionMembersListProps {
  collection: SkosCollectionDto | null;
  shortLocale: string;
}

const DRAG_ICON_SIZE = "24px";

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

type IndexChangeCallback = (
  row: Row<CollectionMember>,
  newIndex: number
) => void;

const OrderInput: FunctionComponent<{
  row: Row<CollectionMember>;
  onIndexChange: IndexChangeCallback;
}> = ({ row, onIndexChange }) => {
  const [order, setOrder] = useState(row.index);
  const onFocusLoss = useCallback(() => {
    onIndexChange(row, order);
  }, [onIndexChange, order, row]);
  return (
    <Input
      className={"order"}
      type={"text"}
      value={order}
      onChange={(e) => setOrder(Number(e.currentTarget.value) || 0)}
      onBlur={onFocusLoss}
    />
  );
};

export const CollectionMembersList: FunctionComponent<
  CollectionMembersListProps
> = ({ shortLocale, collection }: CollectionMembersListProps) => {
  const dispatch: ThunkDispatch = useDispatch();
  const tableInstanceRef: MutableRefObject<Table<CollectionMember> | null> =
    useRef(null);

  const onIndexChange: IndexChangeCallback = useCallback((row, newIndex) => {},
  []);

  const columns = useMemo<ColumnDef<CollectionMember>[]>(
    () => [
      {
        id: "order",
        cell: ({ row }) => (
          <OrderInput row={row} onIndexChange={onIndexChange} />
        ),
        enableSorting: false,
      },
      {
        id: "drag",
        cell: DragReorderIcon,
        enableSorting: false,
      },
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
    [onIndexChange, shortLocale]
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

  const queryKey = ["collection-members-list", collection?.iri];

  return (
    <>
      <FormattedMessage tagName={"h3"} id={"collection.members"} />
      <InfiniteTable<CollectionMember>
        {...{ columns, queryFn, queryKey }}
        disableHeader={true}
        className={
          "skos-collections-list first-row-icon second-row-icon second-row-drag"
        }
        tableInstanceRef={tableInstanceRef}
      />
    </>
  );
};
