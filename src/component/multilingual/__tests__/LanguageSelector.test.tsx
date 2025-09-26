import { mountWithIntl } from "../../../__tests__/environment/Environment";
import LanguageSelector, {
  renderRemovableLanguages,
} from "../LanguageSelector";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Constants from "../../../util/Constants";
import { NavItem } from "reactstrap";
import ISO6391 from "iso-639-1";

describe("LanguageSelector", () => {
  let onSelect: (lang: string) => void;

  beforeEach(() => {
    onSelect = jest.fn();
  });

  it("renders list of languages extracted from multilingual attributes of specified term", () => {
    const languages = ["cs", "de", "en"];
    const result = mountWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={languages}
        {...intlFunctions()}
      />
    );
    const items = result.find(NavItem);
    expect(items.length).toEqual(languages.length);
  });

  it("renders value in selected language as active nav item", () => {
    const languages = ["cs", Constants.DEFAULT_LANGUAGE];
    const result = mountWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={languages}
        {...intlFunctions()}
      />
    );
    const toggle = result.find("a.active");
    expect(toggle.text()).toContain(
      ISO6391.getNativeName(Constants.DEFAULT_LANGUAGE)
    );
  });

  it("renders nothing when there are no alternative translations", () => {
    const result = mountWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={[Constants.DEFAULT_LANGUAGE]}
        {...intlFunctions()}
      />
    );
    expect(result.exists("#term-language-selector")).toBeFalsy();
  });

  describe("language removal", () => {
    let onRemove: (lang: string) => void;

    beforeEach(() => {
      onRemove = jest.fn();
    });

    it("does not allow language removal when there is only one language", () => {
      const wrapper = mountWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en"],
            selectedLanguage: "en",
            formatMessage: intlFunctions().formatMessage,
            onSelect,
            onRemove,
          })}
        </>
      );
      expect(wrapper.exists(".m-remove-lang")).toBeFalsy();
    });

    it("selects the next language when first one is removed", () => {
      const wrapper = mountWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en", "cs"],
            selectedLanguage: "en",
            formatMessage: intlFunctions().formatMessage,
            onSelect,
            onRemove,
          })}
        </>
      );
      wrapper.find(".m-remove-lang").first().simulate("click");
      expect(onRemove).toHaveBeenCalledWith("en");
      expect(onSelect).toHaveBeenCalledWith("cs");
    });

    it("selects the preceding language when the language with non-zero index is removed", () => {
      const wrapper = mountWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en", "cs"],
            selectedLanguage: "en",
            formatMessage: intlFunctions().formatMessage,
            onSelect,
            onRemove,
          })}
        </>
      );
      wrapper.find(".m-remove-lang").last().simulate("click");
      expect(onRemove).toHaveBeenCalledWith("cs");
      expect(onSelect).toHaveBeenCalledWith("en");
    });
  });
});
