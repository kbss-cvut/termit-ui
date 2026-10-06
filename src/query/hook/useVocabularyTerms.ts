import { useInfiniteQuery } from "@tanstack/react-query";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../../model/Term";
import Constants from "../../util/Constants";
import Ajax, { content, params } from "../../util/Ajax";
import JsonLdUtils from "../../util/JsonLdUtils";
import { queryKeys } from "../queryKeys";
import SearchParam, { MatchType } from "../../model/search/SearchParam";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";

export const VOCABULARY_TERMS_PAGE_SIZE = 100;

export interface VocabularyTermsPage {
  pageIndex: number;
  terms: Term[];
  totalCount?: number;
  hasMore: boolean;
}

interface FetchVocabularyTermsPageParams {
  apiPrefix: string;
  vocabularyIri: IRI;
  searchString: string;
  language: string;
  pageParam: number;
  searchParams?: SearchParam[];
  signal?: AbortSignal;
  sort?: string;
}

function resolveTotalCount(headers: unknown): number | undefined {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }

  const xTotalCountHeader =
    (headers as Record<string, string | string[] | undefined>)[
      Constants.Headers.X_TOTAL_COUNT
    ] ??
    (typeof (headers as { get?: (name: string) => string | undefined }).get ===
    "function"
      ? (headers as { get: (name: string) => string | undefined }).get(
          Constants.Headers.X_TOTAL_COUNT
        )
      : undefined);
  const value = Array.isArray(xTotalCountHeader)
    ? xTotalCountHeader[0]
    : xTotalCountHeader;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export async function fetchVocabularyTermsPage({
  apiPrefix,
  vocabularyIri,
  searchString,
  language,
  pageParam,
  searchParams = [],
  signal,
  sort,
}: FetchVocabularyTermsPageParams): Promise<VocabularyTermsPage> {
  const requestParams: {
    full?: boolean;
    flat: boolean;
    namespace?: string;
    searchString?: string;
    language?: string;
    page: number;
    size: number;
    sort?: string;
  } = {
    full: true,
    flat: true,
    language,
    page: pageParam,
    size: VOCABULARY_TERMS_PAGE_SIZE,
  };

  if (searchString.length > 0) {
    requestParams.searchString = searchString;
  }
  if (vocabularyIri.namespace) {
    requestParams.namespace = vocabularyIri.namespace;
  }
  if (sort) {
    requestParams.sort = sort;
  }

  const endpoint = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms`;
  const searchEndpoint = `${apiPrefix}/search/advanced`;

  const finalSearchParams = [...searchParams];

  if (searchParams.length > 0) {
    const fullVocabIri = vocabularyIri.namespace
      ? vocabularyIri.namespace + vocabularyIri.fragment
      : vocabularyIri.fragment;

    // Restrict search to the current vocabulary
    finalSearchParams.push({
      property: VocabularyUtils.SKOS_IN_SCHEME,
      value: [fullVocabIri],
      matchType: MatchType.IRI,
    });
  }

  const requestConfig =
    searchParams.length > 0
      ? content(finalSearchParams)
          .contentType(Constants.JSON_MIME_TYPE)
          .preserveAcceptHeaderInPost()
          .params(requestParams)
      : params(requestParams);

  if (signal) {
    const abortController = new AbortController();
    signal.addEventListener("abort", () => abortController.abort(), {
      once: true,
    });
    requestConfig.signal(abortController);
  }

  const response =
    searchParams.length > 0
      ? await Ajax.post(searchEndpoint, requestConfig)
      : await Ajax.getResponse(endpoint, requestConfig);

  const compacted =
    await JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
      response.data,
      TERM_CONTEXT
    );
  const terms = compacted.map((data) => new Term(data));
  const totalCount = resolveTotalCount(response.headers);

  const hasMore =
    totalCount !== undefined
      ? (pageParam + 1) * VOCABULARY_TERMS_PAGE_SIZE < totalCount
      : terms.length === VOCABULARY_TERMS_PAGE_SIZE;

  return {
    pageIndex: pageParam,
    terms,
    totalCount,
    hasMore,
  };
}

interface UseVocabularyTermsParams {
  apiPrefix: string;
  vocabularyIri: IRI;
  searchString: string;
  language: string;
  searchParams?: SearchParam[];
  sort?: string;
}

function normalizeLanguageTag(language: string): string {
  return (language || "").trim().toLowerCase();
}

/**
 * Feature-local infinite query hook for loading vocabulary terms.
 */
export function useVocabularyTerms({
  apiPrefix,
  vocabularyIri,
  searchString,
  language,
  searchParams = [],
  sort,
}: UseVocabularyTermsParams) {
  const normalizedSearchString = searchString.trim();
  const normalizedLanguage = normalizeLanguageTag(language);

  const baseQueryKey = queryKeys.terms.list({
    apiPrefix,
    vocabularyFragment: vocabularyIri.fragment,
    vocabularyNamespace: vocabularyIri.namespace,
    searchString: normalizedSearchString,
    language: normalizedLanguage,
  });

  return useInfiniteQuery<VocabularyTermsPage>({
    queryKey: [
      ...(Array.isArray(baseQueryKey) ? baseQueryKey : [baseQueryKey]),
      searchParams,
      sort,
    ],
    queryFn: ({ pageParam = 0, signal }) =>
      fetchVocabularyTermsPage({
        apiPrefix,
        vocabularyIri,
        searchString: normalizedSearchString,
        language: normalizedLanguage,
        pageParam: Number(pageParam),
        searchParams,
        signal,
        sort,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.pageIndex + 1 : undefined,
  });
}
