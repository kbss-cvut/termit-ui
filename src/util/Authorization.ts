import User, { EMPTY_USER } from "../model/User";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import Vocabulary from "../model/Vocabulary";

export function isLoggedIn(currentUser?: User | null): boolean {
  return !!currentUser && currentUser !== EMPTY_USER;
}

export function isEditor(currentUser?: User | null): boolean {
  return (
    isLoggedIn(currentUser) &&
    (currentUser?.isAdmin() ||
      Utils.sanitizeArray(currentUser!.types).indexOf(
        VocabularyUtils.USER_EDITOR
      ) !== -1)
  );
}

export function isVocabularyEditable(
  vocabulary: Vocabulary,
  currentUser?: User
): boolean {
  return (
    isEditor(currentUser) &&
    Utils.sanitizeArray(vocabulary.types).indexOf(
      VocabularyUtils.IS_READ_ONLY
    ) === -1
  );
}
