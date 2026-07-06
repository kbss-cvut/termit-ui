import { useMutation, useQueryClient } from "@tanstack/react-query";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../../model/Term";
import Ajax, { content } from "../../util/Ajax";
import VocabularyUtils from "../../util/VocabularyUtils";
import JsonLdUtils from "../../util/JsonLdUtils";
import { queryKeys } from "../queryKeys";

interface UpdateTermVariables {
  apiPrefix: string;
  term: Term;
}

export function useUpdateTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ apiPrefix, term }: UpdateTermVariables) => {
      const termIri = VocabularyUtils.create(term.iri!);
      const vocabularyIri = VocabularyUtils.create(term.vocabulary!.iri!);
      const reqUrl = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms/${termIri.fragment}`;

      const response = await Ajax.put(
        reqUrl,
        content(term.toJsonLd()).params({
          namespace: vocabularyIri.namespace,
        })
      );

      const compacted =
        await JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
          response.data,
          TERM_CONTEXT
        );

      return compacted.map((data) => new Term(data));
    },
    onSuccess: (updatedTerms) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.terms.lists() },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              terms: page.terms.map((term: Term) => {
                const matchingUpdatedTerm = updatedTerms.find(
                  (t) => t.iri === term.iri
                );
                return matchingUpdatedTerm ? matchingUpdatedTerm : term;
              }),
            })),
          };
        }
      );
    },
  });
}
