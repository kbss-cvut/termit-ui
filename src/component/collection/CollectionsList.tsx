import { FunctionComponent, useCallback, useMemo } from "react";
import Vocabulary from "../../model/Vocabulary";
import { SkosCollectionDto } from "../../model/Collection";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useI18n } from "../hook/useI18n";
import { InfiniteTable, QueryFn } from "../../util/InfiniteTable";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadSkosCollections } from "../../action/AsyncCollectionActions";
import VocabularyUtils from "../../util/VocabularyUtils";

export interface CollectionsListProps {
  vocabulary: Vocabulary;
  shortLocale: string;
}

export const DragReorderIcon = ({ size = "1em", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
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

const queryKey = ["collections-list"];

export const CollectionsList: FunctionComponent<CollectionsListProps> = ({
  vocabulary,
  shortLocale,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const columns = useMemo<ColumnDef<SkosCollectionDto>[]>(
    () => [
      {
        id: "drag",
        cell: DragReorderIcon,
        enableSorting: false,
        size: 20,
      },
      {
        id: "label",
        header: i18n("asset.label"),
        accessorFn: (dto) => dto.getLabel(shortLocale),
        size: 80,
        enableSorting: false,
      },
    ],
    [i18n, shortLocale]
  );

  const queryFn: QueryFn<SkosCollectionDto> = useCallback(
    (
      pageNumber: number,
      pageSize: number,
      sorting: SortingState,
      signal?: AbortSignal
    ) => {
      const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
      return dispatch(
        loadSkosCollections(vocabularyIri, pageNumber, pageSize, signal)
      );
    },
    [vocabulary.iri, dispatch]
  );

  return (
    <InfiniteTable<SkosCollectionDto> {...{ columns, queryKey, queryFn }} />
  );
};
