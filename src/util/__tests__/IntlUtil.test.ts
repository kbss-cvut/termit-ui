import {
  getLanguages,
  loadInitialLocalizationData,
  loadLocalizationData,
  removeTranslation,
  saveLanguagePreference,
} from "../IntlUtil";
import Constants from "../Constants";
import BrowserStorage from "../BrowserStorage";
import Generator from "../../__tests__/environment/Generator";
import { TERM_MULTILINGUAL_ATTRIBUTES } from "../../model/Term";
import { VOCABULARY_MULTILINGUAL_ATTRIBUTES } from "../../model/Vocabulary";

jest.mock("../BrowserStorage");

describe("IntlUtil", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

  it("loads localization data based on language preference stored in browser storage", () => {
    (BrowserStorage.get as jest.Mock).mockReturnValue(Constants.LANG.CS.locale);
    const result = loadInitialLocalizationData();
    expect(result.locale).toEqual(Constants.LANG.CS.locale);
  });

  it("stores language preference in browser storage", () => {
    saveLanguagePreference(Constants.LANG.CS.locale);
    expect(BrowserStorage.set).toHaveBeenCalledWith(
      Constants.STORAGE_LANG_KEY,
      Constants.LANG.CS.locale
    );
  });

  describe("getLanguages", () => {
    it("resolves unique languages from a Term instance", () => {
      const term = Generator.generateTerm();
      term.label.cs = "Český název";
      term.label.de = "Deutscher name";
      const result = getLanguages(TERM_MULTILINGUAL_ATTRIBUTES, term);
      expect(result).toEqual(["cs", "de", "en"]);
    });

    it("resolves unique languages from a Vocabulary instance", () => {
      const voc = Generator.generateVocabulary();
      voc.label.cs = "Český název";
      voc.label.de = "Deutscher name";
      voc.comment = {
        en: "English description",
        cs: "Anglický popis",
      };
      const result = getLanguages(VOCABULARY_MULTILINGUAL_ATTRIBUTES, voc);
      expect(result).toEqual(["cs", "de", "en"]);
    });
  });

  describe("removeTranslation", () => {
    it("removes values in specified language from Term", () => {
      const term = Generator.generateTerm();
      term.label.cs = "Český název";
      term.definition = {
        cs: "Definice pojmu v češtině",
        en: "Term definition in English",
      };
      term.altLabels = {
        cs: ["Alternativní název"],
        en: ["Synonym"],
      };

      removeTranslation(TERM_MULTILINGUAL_ATTRIBUTES, term, "en");
      TERM_MULTILINGUAL_ATTRIBUTES.filter(
        (att) => term[att] !== undefined
      ).forEach((att) => expect(term[att]["en"]).not.toBeDefined());
    });

    it("removes values in specified language from Vocabulary", () => {
      const voc = Generator.generateVocabulary();
      voc.label.cs = "Český název";
      voc.comment = {
        en: "English description",
        cs: "Anglický popis",
      };

      removeTranslation(VOCABULARY_MULTILINGUAL_ATTRIBUTES, voc, "cs");
      VOCABULARY_MULTILINGUAL_ATTRIBUTES.filter(
        (att) => voc[att] !== undefined
      ).forEach((att) => expect(voc[att]["cs"]).not.toBeDefined());
    });
  });
});
