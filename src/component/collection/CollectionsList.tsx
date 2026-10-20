import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Vocabulary from "../../model/Vocabulary";
import { SkosCollectionDto } from "../../model/Collection";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Table, { RowOverride } from "../misc/table/Table";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadSkosCollections } from "../../action/AsyncCollectionActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import "./CollectionsList.scss";
import { INITIAL_PAGINATION } from "../../util/UISettingsUtil";
import { FaSort } from "react-icons/fa";
import Routing from "../../util/Routing";

export interface CollectionsListProps {
  vocabulary: Vocabulary;
  shortLocale: string;
}

export const CollectionsList: FunctionComponent<CollectionsListProps> = ({
  vocabulary,
  shortLocale,
}) => {
  const dispatch: ThunkDispatch = useDispatch();
  const [collections, setCollections] = useState<SkosCollectionDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);

  // Reset pagination when vocabulary changes
  useEffect(() => {
    setPagination(INITIAL_PAGINATION);
  }, [vocabulary.iri]);

  useEffect(() => {
    const controller = new AbortController();
    const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
    dispatch(
      loadSkosCollections(
        vocabularyIri,
        pagination.pageIndex,
        pagination.pageSize,
        controller.signal
      )
    ).then((page) => {
      if (!controller.signal.aborted) {
        setCollections(page.pageContent);
        setTotalCount(page.totalCount);
      }
    });
    return () => controller.abort();
  }, [vocabulary.iri, pagination.pageIndex, pagination.pageSize, dispatch]);

  const columns = useMemo<ColumnDef<SkosCollectionDto>[]>(
    () => [
      {
        id: "sort-icon",
        header: "",
        cell: ({ row }) => {
          if (row.original.isOrdered()) {
            return <FaSort />;
          } else {
            return null;
          }
        },
        size: 15,
      },
      {
        id: "label",
        header: "",
        accessorFn: (dto) => dto.getLabel(shortLocale),
        enableSorting: false,
      },
    ],
    [shortLocale]
  );

  const rowProps: RowOverride<SkosCollectionDto> = useCallback(
    ({ original }) => ({
      onClick: () => Routing.transitionToSkosCollection(original),
    }),
    []
  );

  const tableInstance = useReactTable<SkosCollectionDto>({
    columns,
    data: collections,
    getCoreRowModel: getCoreRowModel(),
    enableColumnFilters: false,
    enableSorting: false,
    manualPagination: true,
    rowCount: totalCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function" ? updater(pagination) : updater;
      if (
        newState.pageSize !== pagination.pageSize ||
        newState.pageIndex !== pagination.pageIndex
      ) {
        setPagination(newState);
      }
    },
  });

  return (
    <div className={"skos-collections-list"}>
      <Table instance={tableInstance} overrideRowProps={rowProps} />
    </div>
  );
};
