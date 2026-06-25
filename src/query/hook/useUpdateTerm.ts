import { useMutation, useQueryClient } from "@tanstack/react-query";
import Term from "../../model/Term";
import Ajax, { content } from "../../util/Ajax";
import VocabularyUtils from "../../util/VocabularyUtils";

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

      return response.data;
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === "terms" && query.queryKey[1] === "list";
        },
      });
    },
  });
}
