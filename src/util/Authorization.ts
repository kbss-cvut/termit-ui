import User, { EMPTY_USER } from "../model/User";
import Utils from "./Utils";
import VocabularyUtils from "./VocabularyUtils";
import { AssetData } from "../model/Asset";

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

export function isAssetEditable(asset: AssetData, currentUser?: User): boolean {
  return (
    isEditor(currentUser) &&
    Utils.sanitizeArray(asset.types).indexOf(VocabularyUtils.IS_READ_ONLY) ===
      -1
  );
}
