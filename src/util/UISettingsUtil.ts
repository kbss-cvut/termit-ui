import Constants from "./Constants";
import BrowserStorage from "./BrowserStorage";
import { PAGE_SIZES } from "../component/misc/table/Pagination";

export function saveTermsFlatListPreference(value: boolean) {
  BrowserStorage.set(Constants.STORAGE_TERMS_FLAT_LIST_KEY, String(value));
}

export function loadTermsFlatListPreference(): boolean {
  return BrowserStorage.get(Constants.STORAGE_TERMS_FLAT_LIST_KEY) === "true";
}

/**
 * Tries to load saved page size from local storage.
 * If no size is saved, falls back to the middle value of {@link PAGE_SIZES}.
 */
export function getInitialPageSize() {
  const savedSize = Number(
    BrowserStorage.get(Constants.STORAGE_TABLE_PAGE_SIZE_KEY)
  );
  if (savedSize && Number.isFinite(savedSize)) {
    return savedSize;
  }
  return PAGE_SIZES[Math.round(PAGE_SIZES.length / 2)];
}
