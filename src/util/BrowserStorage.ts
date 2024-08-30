/**
 * Represent an interface to the browser-based storage
 */
const BrowserStorage = {
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
    this.dispatchStorageEvent();
  },

  get(key: string, defaultValue: string | null = null): string | null {
    const result = localStorage.getItem(key);
    return result != null ? result : defaultValue;
  },

  remove(key: string): void {
    localStorage.removeItem(key);
    this.dispatchStorageEvent();
  },

  dispatchStorageEvent() {
    window.dispatchEvent(new Event("storage"));
  },

  /**
   * Adds {@link #callback} as event listener for the {@code storage} event.
   * @param callback the event listener
   * @returns unsubscribe callback
   */
  onChange(callback: (event: StorageEvent) => void) {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  },
};

export default BrowserStorage;
