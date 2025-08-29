import Constants from "./Constants";
import BrowserStorage from "./BrowserStorage";

export function saveTermsFlatListPreference(value: boolean) {
  BrowserStorage.set(Constants.STORAGE_TERMS_FLAT_LIST_KEY, String(value));
}

export function loadTermsFlatListPreference(): boolean {
  return BrowserStorage.get(Constants.STORAGE_TERMS_FLAT_LIST_KEY) === "true";
}
