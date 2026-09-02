import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { TermBatchEditDto } from "../../model/TermBatchEditDto";
import Ajax, { content } from "../../util/Ajax";
import VocabularyUtils from "../../util/VocabularyUtils";
import { queryKeys } from "../queryKeys";
import Term from "../../model/Term";
import { publishMessage } from "../../action/SyncActions";
import { createFormattedMessage } from "../../model/Message";
import MessageType from "../../model/MessageType";

interface BatchEditParams {
  apiPrefix: string;
  vocabularyIri: string;
  data: TermBatchEditDto;
}

/**
 * Provides a hook for batch editing terms in a vocabulary. Updates the UI
 * optimistically and fetches the latest data from the server after a
 * successful mutation. Dispatches messages to the Redux store to indicate the
 * status of the operation.
 */
export const useBatchEditTerms = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ apiPrefix, vocabularyIri, data }: BatchEditParams) => {
      const vocabHelper = VocabularyUtils.create(vocabularyIri);
      const reqUrl = `${apiPrefix}/vocabularies/${vocabHelper.fragment}/terms`;

      const serverPayload = {
        targetTerms: data.targetTerms,
        types: data.types,
        exactMatchTerms: data.exactMatchTerms?.map((t) => t.iri),
        related: data.related?.map((t) => t.iri),
        relatedMatch: data.relatedMatch?.map((t) => t.iri),
        parentTerms: data.parentTerms?.map((t) => t.iri),
      };

      await Ajax.patch(
        reqUrl,
        content(serverPayload).contentType("application/json").params({
          namespace: vocabHelper.namespace,
        })
      );
    },

    onSuccess: (_, variables) => {
      const { data } = variables;

      queryClient.setQueriesData(
        { queryKey: queryKeys.terms.lists() },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              terms: page.terms.map((term: Term) => {
                if (term.iri && data.targetTerms.includes(term.iri)) {
                  const updatedData = term.toTermData();

                  if (data.types?.length) {
                    updatedData.types = Array.from(
                      new Set([...(updatedData.types || []), ...data.types])
                    );
                  }
                  if (data.exactMatchTerms?.length) {
                    updatedData.exactMatchTerms = [
                      ...(updatedData.exactMatchTerms || []),
                      ...data.exactMatchTerms,
                    ];
                  }
                  if (data.related?.length) {
                    updatedData.relatedTerms = [
                      ...(updatedData.relatedTerms || []),
                      ...data.related,
                    ];
                  }
                  if (data.relatedMatch?.length) {
                    updatedData.relatedMatchTerms = [
                      ...(updatedData.relatedMatchTerms || []),
                      ...data.relatedMatch,
                    ];
                  }
                  if (data.parentTerms?.length) {
                    updatedData.parentTerms = [
                      ...(updatedData.parentTerms || []),
                      ...data.parentTerms,
                    ];
                  }

                  return new Term(updatedData);
                }
                return term;
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

      queryClient
        .invalidateQueries({
          queryKey: queryKeys.terms.lists(),
          refetchType: "active",
        })
        .then(() => {
          dispatch(
            publishMessage(
              createFormattedMessage(
                "vocabulary.sync.finished.message",
                undefined,
                MessageType.SUCCESS
              )
            )
          );
        });
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
};
