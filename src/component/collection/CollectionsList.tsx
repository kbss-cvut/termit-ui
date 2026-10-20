import { FunctionComponent, useCallback, useMemo } from "react";
import Vocabulary from "../../model/Vocabulary";
import { SkosCollectionDto } from "../../model/Collection";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { InfiniteTable, QueryFn } from "../../util/InfiniteTable";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadSkosCollections } from "../../action/AsyncCollectionActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import "./CollectionsList.scss";
import { Link } from "react-router-dom";
import Routes from "../../util/Routes";
import { Routing } from "../../util/Routing";

export interface CollectionsListProps {
  vocabulary: Vocabulary;
  shortLocale: string;
}

const queryKey = ["collections-list"];

const CollectionLink: FunctionComponent<{ collection: SkosCollectionDto }> = ({
  collection,
  children,
}) => {
  console.debug(collection);
  const path = useMemo(() => {
    const collectionIri = VocabularyUtils.create(collection.iri);
    const vocabularyIri = VocabularyUtils.create(collection.vocabulary.iri);
    return Routing.getTransitionPath(Routes.vocabularyCollectionDetail, {
      params: new Map([
        ["name", vocabularyIri.fragment],
        ["collectionName", collectionIri.fragment],
      ]),
      query: new Map([
        ["namespace", encodeURIComponent(vocabularyIri.namespace!)],
        ["collectionNamespace", encodeURIComponent(collectionIri.namespace!)],
      ]),
    });
  }, [collection.iri, collection.vocabulary]);
  return <Link to={path}>{children}</Link>;
};

export const CollectionsList: FunctionComponent<CollectionsListProps> = ({
  vocabulary,
  shortLocale,
}) => {
  const dispatch: ThunkDispatch = useDispatch();

  const columns = useMemo<ColumnDef<SkosCollectionDto>[]>(
    () => [
      {
        id: "label",
        accessorFn: (dto) => dto.getLabel(shortLocale),
        cell: ({ row, getValue }) => (
          <CollectionLink collection={row.original}>
            {getValue<string>()}
          </CollectionLink>
        ),
        enableSorting: false,
      },
    ],
    [shortLocale]
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
    <InfiniteTable<SkosCollectionDto>
      {...{ columns, queryKey, queryFn }}
      className={"skos-collections-list"}
      disableHeader={true}
    />
  );
};
