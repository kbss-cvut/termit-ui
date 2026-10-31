import { InfiniteData } from "@tanstack/react-query";
import { ResultPage } from "../../model/ResultPage";
import { useMemo } from "react";
import { IRI, IRIImpl } from "../../util/VocabularyUtils";
import { useLocation, useParams } from "react-router-dom";
import Utils from "../../util/Utils";
import { useAppSelector } from "../../util/Types";

/**
 * Moves the item at fromIndex to toIndex while preserving the size of each page
 */
export function moveInPages<T>(
  data: InfiniteData<ResultPage<T>>,
  fromIndex: number,
  toIndex: number
): InfiniteData<ResultPage<T>> {
  const flatData = data.pages.flatMap((page) => page.pageContent);
  const [moved] = flatData.splice(fromIndex, 1);
  flatData.splice(toIndex, 0, moved);
  let offset = 0;
  return {
    ...data,
    pages: data.pages.map((page) => {
      const pageContent = flatData.slice(
        offset,
        offset + page.pageContent.length
      );
      offset += page.pageContent.length;
      return { ...page, pageContent };
    }),
  };
}

/**
 * Extracts collectionName parameter from the current location and combines it with collectionNamespace query parameter
 *
 * @returns collection URI from the current location
 */
export function useCollectionUri(): IRIImpl | null {
  const { collectionName } = useParams<{
    collectionName: string;
  }>();
  const location = useLocation();
  const collectionNamespace = Utils.extractQueryParam(
    location.search,
    "collectionNamespace"
  );
  const iri = useMemo(
    () => new IRIImpl(collectionName, collectionNamespace),
    [collectionName, collectionNamespace]
  );
  if (!collectionName || !collectionNamespace) {
    return null;
  }
  return iri;
}

/**
 * Extracts vocabulary name from the current location and combines it with namespace query parameter
 *
 * @returns vocabulary URI from the current location
 */
export function useVocabularyUri(): IRI {
  const { name } = useParams<{
    name: string; // vocabulary fragment
  }>();
  const configuration = useAppSelector((state) => state.configuration);
  const { search } = useLocation();
  return useMemo(
    () => Utils.resolveVocabularyIriFromRoute({ name }, search, configuration),
    [configuration, name, search]
  );
}
