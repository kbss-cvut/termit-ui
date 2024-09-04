export const TOKEN_CHANGE_EVENT = "token-change";

/**
 * Represent an interface to the browser-based storage
 */
const BrowserStorage = {
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  get(key: string, defaultValue: string | null = null): string | null {
    const result = localStorage.getItem(key);
    return result != null ? result : defaultValue;
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  dispatchTokenChangeEvent() {
    window.dispatchEvent(
      new Event(TOKEN_CHANGE_EVENT, { bubbles: true, cancelable: false })
    );
  },

  /**
   * Adds {@link #callback} as event listener for the {@link TOKEN_CHANGE_EVENT}.
   * @param callback the event listener
   * @returns unsubscribe callback
   */
  onTokenChange(callback: (event: Event) => void) {
    window.addEventListener(TOKEN_CHANGE_EVENT, callback);
    return () => window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
  },
};

export default BrowserStorage;
