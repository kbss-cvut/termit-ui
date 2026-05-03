import { useInfiniteQuery } from "@tanstack/react-query";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../../model/Term";
import Constants from "../../util/Constants";
import Ajax, { params } from "../../util/Ajax";
import JsonLdUtils from "../../util/JsonLdUtils";
import { IRI } from "../../util/VocabularyUtils";
import { queryKeys } from "../queryKeys";

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
  signal?: AbortSignal;
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
  signal,
}: FetchVocabularyTermsPageParams): Promise<VocabularyTermsPage> {
  const requestParams: {
    full?: boolean;
    flat: boolean;
    namespace?: string;
    searchString?: string;
    language?: string;
    page: number;
    size: number;
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

  const requestConfig = params(requestParams);
  const endpoint = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms`;

  if (signal) {
    const abortController = new AbortController();
    signal.addEventListener("abort", () => abortController.abort(), {
      once: true,
    });
    requestConfig.signal(abortController);
  }

  const response = await Ajax.getResponse(endpoint, requestConfig);
  const compacted =
    await JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
      response.data,
      TERM_CONTEXT
    );
  const terms = compacted.map((data) => new Term(data));
  let totalCount = resolveTotalCount(response.headers);

  if (totalCount === undefined && pageParam === 0) {
    const countParams: {
      full?: boolean;
      flat?: boolean;
      namespace?: string;
      searchString?: string;
      language?: string;
    } = {
      full: true,
      flat: true,
      language,
    };

    if (searchString.length > 0) {
      countParams.searchString = searchString;
    }
    if (vocabularyIri.namespace) {
      countParams.namespace = vocabularyIri.namespace;
    }

    try {
      const countResponse = await Ajax.head(endpoint, params(countParams));
      totalCount = resolveTotalCount(countResponse.headers);
    } catch {
      // Ignore fallback count errors and keep unknown total behavior.
    }
  }

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
}: UseVocabularyTermsParams) {
  const normalizedSearchString = searchString.trim();
  const normalizedLanguage = normalizeLanguageTag(language);

  return useInfiniteQuery<VocabularyTermsPage>({
    queryKey: queryKeys.terms.list({
      apiPrefix,
      vocabularyFragment: vocabularyIri.fragment,
      vocabularyNamespace: vocabularyIri.namespace,
      searchString: normalizedSearchString,
      language: normalizedLanguage,
    }),
    queryFn: ({ pageParam = 0, signal }) =>
      fetchVocabularyTermsPage({
        apiPrefix,
        vocabularyIri,
        searchString: normalizedSearchString,
        language: normalizedLanguage,
        pageParam: Number(pageParam),
        signal,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.pageIndex + 1 : undefined,
  });
}
