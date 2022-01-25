import { IRI } from "../util/VocabularyUtils";
import { ThunkDispatch } from "../util/Types";
import { loadTerm } from "./AsyncActions";
import Constants from "../util/Constants";

export function loadPublicTerm(termFragment: string, vocabularyIri: IRI) {
  return (dispatch: ThunkDispatch) =>
    dispatch(
      loadTerm(termFragment, vocabularyIri, Constants.PUBLIC_API_PREFIX)
    );
}
