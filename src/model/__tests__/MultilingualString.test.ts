import {getLocalized, NO_LANG} from "../MultilingualString";
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
});
