import {
  compactMultilingualCustomAttributeValues,
  getLocalized,
  getLocalizedOrDefault,
  getLocalizedPlural,
  hasNonBlankValue,
  NO_LANG,
} from "../MultilingualString";
import Constants from "../../util/Constants";

describe("MultilingualString", () => {
  describe("getLocalized", () => {
    it("returns value when specified language exists in string", () => {
      const value = { en: "Test", cs: "Test dva" };
      expect(getLocalized(value, "cs")).toEqual(value.cs);
    });

    it("returns value in default language when no language is specified", () => {
      const value = { es: "casa" };
      value[Constants.DEFAULT_LANGUAGE] = "building";
      expect(getLocalized(value)).toEqual(value[Constants.DEFAULT_LANGUAGE]);
    });

    it("returns value without language when no language is specified and default language value does not exist in string", () => {
      const value = { cs: "budova", "@none": "building" };
      expect(getLocalized(value)).toEqual(value[NO_LANG]);
    });

    it("returns value in any language when no language is specified  and neither default language nor no language value exists in string", () => {
      const value = { es: "casa" };
      expect(getLocalized(value)).toEqual(value.es);
    });

    it("returns undefined when no string contains no value", () => {
      expect(getLocalized({})).not.toBeDefined();
    });

    it("returns the argument when it is a string", () => {
      const value = "budova";
      expect(getLocalized(value)).toEqual(value);
    });
  });

  describe("getLocalizedOrDefault", () => {
    it("returns value when specified language exists in string", () => {
      const value = { en: "Test", cs: "Test dva" };
      expect(getLocalizedOrDefault(value, "", "cs")).toEqual(value.cs);
    });

    it("returns value in default language when no language is specified", () => {
      const value = { es: "casa" };
      value[Constants.DEFAULT_LANGUAGE] = "building";
      expect(getLocalizedOrDefault(value, "")).toEqual(
        value[Constants.DEFAULT_LANGUAGE]
      );
    });

    it("returns specified default value when value in specified languages does not exist", () => {
      const value = { cs: "budova" };
      const defaultValue = "building";
      expect(getLocalizedOrDefault(value, defaultValue, "en")).toEqual(
        defaultValue
      );
    });

    it("returns the argument when it is a string", () => {
      const value = "budova";
      expect(getLocalizedOrDefault(value, "defaultValue")).toEqual(value);
    });

    it("returns value without language when target language value is not present", () => {
      const value = { "@none": "building" };
      expect(getLocalizedOrDefault(value, "defaultValue")).toEqual(
        value["@none"]
      );
    });
  });

  describe("getLocalizedPlural", () => {
    it("returns value when specified language exists in string", () => {
      const value = { en: ["Test"], cs: ["Test dva", "Test tři"] };
      expect(getLocalizedPlural(value, "cs")).toEqual(value.cs);
    });

    it("returns value in default language when no language is specified", () => {
      const value = { es: ["casa"] };
      value[Constants.DEFAULT_LANGUAGE] = ["building"];
      expect(getLocalizedPlural(value)).toEqual(
        value[Constants.DEFAULT_LANGUAGE]
      );
    });

    it("returns value without language when no language is specified and default language value does not exist in string", () => {
      const value = { cs: ["budova"], "@none": ["building"] };
      expect(getLocalizedPlural(value)).toEqual(value[NO_LANG]);
    });

    it("returns empty array when no matching value is present", () => {
      const value = { es: ["casa"] };
      expect(getLocalizedPlural(value)).toEqual([]);
    });
  });

  describe("hasNonBlankValue", () => {
    it.each([
      { expected: true, value: { cs: "budova" } },
      { expected: false, value: { en: "building" } },
      {
        expected: false,
        value: { cs: "" },
      },
    ])("returns correct value", ({ expected, value }) => {
      expect(hasNonBlankValue(value as any, "cs")).toEqual(expected);
    });
  });

  describe("compactMultilingualCustomAttributeValues", () => {
    it("does nothing when no multilingual custom attributes are supplied", () => {
      const asset: any = { custom: [{ "@value": "test" }] };
      compactMultilingualCustomAttributeValues(asset, []);
      expect(asset.custom).toEqual([{ "@value": "test" }]);
    });

    it("compacts a single object value into a plural multilingual string", () => {
      const asset: any = {
        plainAttribute: { "@value": "test", "@language": "en" },
      };
      compactMultilingualCustomAttributeValues(asset, ["plainAttribute"]);
      expect(asset.plainAttribute).toEqual({
        en: ["test"],
      });
    });

    it("compacts array values into a plural multilingual string grouped by language", () => {
      const asset: any = {
        values: [
          { "@value": "one", "@language": "en" },
          { "@value": "two", "@language": "en" },
          { "@value": "jedna", "@language": "cs" },
        ],
      };
      compactMultilingualCustomAttributeValues(asset, ["values"]);
      expect(asset.values).toEqual({
        en: ["one", "two"],
        cs: ["jedna"],
      });
    });

    it("uses the no-language key when @language is missing", () => {
      const asset: any = {
        values: [
          { "@value": "no language" },
          { "@value": "en value", "@language": "en" },
        ],
      };
      compactMultilingualCustomAttributeValues(asset, ["values"]);
      expect(asset.values).toEqual({
        [NO_LANG]: ["no language"],
        en: ["en value"],
      });
    });

    it("skips items without an @value", () => {
      const asset: any = {
        values: [
          { "@value": "valid", "@language": "en" },
          { "@language": "en" },
          { unrelated: "ignored" },
        ],
      };
      compactMultilingualCustomAttributeValues(asset, ["values"]);
      expect(asset.values).toEqual({ en: ["valid"] });
    });

    it("processes multiple attributes", () => {
      const asset: any = {
        first: [{ "@value": "a", "@language": "en" }],
        second: [{ "@value": "b", "@language": "cs" }],
      };
      compactMultilingualCustomAttributeValues(asset, ["first", "second"]);
      expect(asset.first).toEqual({ en: ["a"] });
      expect(asset.second).toEqual({ cs: ["b"] });
    });

    it("skips attributes that are not arrays while still processing valid ones", () => {
      const asset: any = {
        valid: [{ "@value": "a", "@language": "en" }],
        invalid: "not an array",
      };
      compactMultilingualCustomAttributeValues(asset, ["valid", "invalid"]);
      expect(asset.valid).toEqual({ en: ["a"] });
      expect(asset.invalid).toEqual("not an array");
    });
  });
});
