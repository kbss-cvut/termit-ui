import {loadInitialLocalizationData, loadLocalizationData, saveLanguagePreference} from "../IntlUtil";
import Constants from "../Constants";

describe("IntlUtil", () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it("loads Czech localization data for Czech language", () => {
        const result = loadLocalizationData(Constants.LANG.CS.locale);
        expect(result.locale).toEqual(Constants.LANG.CS.locale);
    });

    it("loads English localization data for English language", () => {
        const result = loadLocalizationData(Constants.LANG.EN.locale);
        expect(result.locale).toEqual(Constants.LANG.EN.locale);
    });

    it("loads English localization data by default", () => {
        const result = loadLocalizationData("de");
        expect(result.locale).toEqual(Constants.LANG.EN.locale);
    });

    it("loads localization data based on language preference stored in localStorage", () => {
        localStorage.__STORE__[Constants.STORAGE_LANG_KEY] = Constants.LANG.CS.locale;
        const result = loadInitialLocalizationData();
        expect(result.locale).toEqual(Constants.LANG.CS.locale);
    });

    it("stores language preference in local storage", () => {
        saveLanguagePreference(Constants.LANG.CS.locale);
        expect(localStorage.__STORE__[Constants.STORAGE_LANG_KEY]).toEqual(Constants.LANG.CS.locale);
    });
});