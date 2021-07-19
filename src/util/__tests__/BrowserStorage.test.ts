import BrowserStorage from "../BrowserStorage";

describe("BrowserStorage", () => {
  const key = "testKey";
  const value = "testValue";

  beforeEach(() => {
    localStorage.clear();
  });

  describe("set", () => {
    it("saves the specified value under the specified key into the local storage", () => {
      BrowserStorage.set(key, value);
      expect(localStorage.__STORE__[key]).toEqual(value);
    });
  });

  describe("get", () => {
    it("returns value stored for the specified key", () => {
      localStorage.__STORE__[key] = value;
      expect(BrowserStorage.get(key)).toEqual(value);
    });

    it("returns the provided defaultValue when storage contains no value for the specified key", () => {
      const defaultValue = "defaultValue";
      expect(BrowserStorage.get(key, defaultValue)).toEqual(defaultValue);
    });

    it("returns null when no storage contains no value for the specified key and no default value is provided", () => {
      expect(BrowserStorage.get(key)).toBeNull();
    });
  });

  describe("remove", () => {
    it("removes stored key value", () => {
      localStorage.__STORE__[key] = value;
      BrowserStorage.remove(key);
      expect(localStorage.__STORE__[key]).not.toBeDefined();
    });
  });
});
