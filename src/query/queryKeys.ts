interface TermListParams {
  apiPrefix: string;
  vocabularyFragment: string;
  vocabularyNamespace?: string;
  searchString: string;
  language: string;
}

/**
 * Global registry for all React Query keys in the application.
 */
export const queryKeys = {
  terms: {
    all: ["terms"] as const,
    lists: () => [...queryKeys.terms.all, "list"] as const,
    list: (params: TermListParams) =>
      [
        ...queryKeys.terms.lists(),
        {
          apiPrefix: params.apiPrefix,
          vocabularyFragment: params.vocabularyFragment,
          vocabularyNamespace: params.vocabularyNamespace || null,
          searchString: params.searchString,
          language: params.language,
        },
      ] as const,
    details: () => [...queryKeys.terms.all, "detail"] as const,
    detail: (termIri: string) =>
      [...queryKeys.terms.details(), termIri] as const,
  },
  vocabularies: {
    all: ["vocabularies"] as const,
    lists: () => [...queryKeys.vocabularies.all, "list"] as const,
    details: () => [...queryKeys.vocabularies.all, "detail"] as const,
    detail: (vocabularyIri: string) =>
      [...queryKeys.vocabularies.details(), vocabularyIri] as const,
  },
};
