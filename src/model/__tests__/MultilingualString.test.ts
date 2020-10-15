import {getLocalized, getLocalizedOrDefault, getLocalizedPlural, NO_LANG} from "../MultilingualString";
import Constants from "../../util/Constants";

describe("MultilingualString", () => {

    describe("getLocalized", () => {
        it("returns value when specified language exists in string", () => {
            const value = {"en": "Test", "cs": "Test dva"};
            expect(getLocalized(value, "cs")).toEqual(value.cs);
        });

        it("returns value in default language when no language is specified", () => {
            const value = {"es": "casa"};
            value[Constants.DEFAULT_LANGUAGE] = "building";
            expect(getLocalized(value)).toEqual(value[Constants.DEFAULT_LANGUAGE]);
        });

        it("returns value without language when no language is specified and default language value does not exist in string", () => {
            const value = {"cs": "budova", "@none": "building"};
            expect(getLocalized(value)).toEqual(value[NO_LANG]);
        });

        it("returns value in any language when no language is specified  and neither default language nor no language value exists in string", () => {
            const value = {"es": "casa"};
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
            const value = {"en": "Test", "cs": "Test dva"};
            expect(getLocalizedOrDefault(value,"", "cs")).toEqual(value.cs);
        });

        it("returns value in default language when no language is specified", () => {
            const value = {"es": "casa"};
            value[Constants.DEFAULT_LANGUAGE] = "building";
            expect(getLocalizedOrDefault(value, "")).toEqual(value[Constants.DEFAULT_LANGUAGE]);
        });

        it("returns specified default value when value in specified languages does not exist", () => {
            const value = {"cs": "budova"};
            const defaultValue = "building";
            expect(getLocalizedOrDefault(value, defaultValue, "en")).toEqual(defaultValue);
        });

        it("returns the argument when it is a string", () => {
            const value = "budova";
            expect(getLocalizedOrDefault(value, "defaultValue")).toEqual(value);
        });

        it("returns value without language when target language value is not present", () => {
            const value = {"@none": "building"};
            expect(getLocalizedOrDefault(value, "defaultValue")).toEqual(value["@none"]);
        });
    });

    describe("getLocalizedPlural", () => {
        it("returns value when specified language exists in string", () => {
            const value = {"en": ["Test"], "cs": ["Test dva", "Test tři"]};
            expect(getLocalizedPlural(value, "cs")).toEqual(value.cs);
        });

        it("returns value in default language when no language is specified", () => {
            const value = {"es": ["casa"]};
            value[Constants.DEFAULT_LANGUAGE] = ["building"];
            expect(getLocalizedPlural(value)).toEqual(value[Constants.DEFAULT_LANGUAGE]);
        });

        it("returns value without language when no language is specified and default language value does not exist in string", () => {
            const value = {"cs": ["budova"], "@none": ["building"]};
            expect(getLocalizedPlural(value)).toEqual(value[NO_LANG]);
        });

        it("returns empty array when no matching value is present", () => {
            const value = {"es": ["casa"]};
            expect(getLocalizedPlural(value)).toEqual([]);
        });
    });
});
