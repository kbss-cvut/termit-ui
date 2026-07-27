import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import Term from "../../model/Term";
import Ajax, { content } from "../../util/Ajax";
import VocabularyUtils from "../../util/VocabularyUtils";
import { queryKeys } from "../queryKeys";
import { publishMessage } from "../../action/SyncActions";
import { createFormattedMessage } from "../../model/Message";
import MessageType from "../../model/MessageType";

interface UpdateTermVariables {
  apiPrefix: string;
  term: Term;
}

export function useUpdateTerm() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ apiPrefix, term }: UpdateTermVariables) => {
      const termIri = VocabularyUtils.create(term.iri!);
      const vocabularyIri = VocabularyUtils.create(term.vocabulary!.iri!);
      const reqUrl = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms/${termIri.fragment}`;

      await Ajax.put(
        reqUrl,
        content(term.toJsonLd()).params({
          namespace: vocabularyIri.namespace,
        })
      );
    },

    onSuccess: async (_, variables) => {
      const updatedTerm = variables.term;

      queryClient.setQueriesData(
        { queryKey: queryKeys.terms.lists() },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              terms: page.terms.map((term: Term) => {
                return term.iri === updatedTerm.iri ? updatedTerm : term;
              }),
            })),
          };
        }
      );

      dispatch(
        publishMessage(
          createFormattedMessage(
            "vocabulary.sync.started.message",
            undefined,
            MessageType.INFO
          )
        )
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.terms.lists(),
        refetchType: "active",
      });

      dispatch(
        publishMessage(
          createFormattedMessage(
            "vocabulary.sync.finished.message",
            undefined,
            MessageType.SUCCESS
          )
        )
      );
    },

    onError: () => {
      dispatch(
        publishMessage(
          createFormattedMessage(
            "term.updated.error.message",
            undefined,
            MessageType.ERROR
          )
        )
      );
    },
  });
}
