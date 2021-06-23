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
};

export default BrowserStorage;
