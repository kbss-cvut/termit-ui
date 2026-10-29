import { renderWithIntl } from "../../../__tests__/environment/Environment";
import LanguageSelector, {
  renderRemovableLanguages,
} from "../LanguageSelector";
import Constants from "../../../util/Constants";
import ISO6391 from "iso-639-1";
import { fireEvent, screen } from "@testing-library/react";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";

describe("LanguageSelector", () => {
  let onSelect: (lang: string) => void;

  beforeEach(() => {
    onSelect = vi.fn();
  });

  it("renders list of languages extracted from multilingual attributes of specified term", () => {
    const languages = ["cs", "de", "en"];
    renderWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={languages}
      />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(languages.length);
    languages.forEach((language) => {
      expect(
        screen.getByText(ISO6391.getNativeName(language))
      ).toBeInTheDocument();
    });
  });

  it("renders value in selected language as active nav item", () => {
    const languages = ["cs", Constants.DEFAULT_LANGUAGE];
    renderWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={languages}
      />
    );
    expect(
      screen.getByText(ISO6391.getNativeName(Constants.DEFAULT_LANGUAGE))
    ).toHaveClass("active");
  });

  it("renders nothing when there are no alternative translations", () => {
    const { container } = renderWithIntl(
      <LanguageSelector
        onSelect={onSelect}
        language={Constants.DEFAULT_LANGUAGE}
        languages={[Constants.DEFAULT_LANGUAGE]}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe("language removal", () => {
    let onRemove: (lang: string) => void;

    beforeEach(() => {
      onRemove = vi.fn();
    });

    it("does not allow language removal when there is only one language", () => {
      const { container } = renderWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en"],
            selectedLanguage: "en",
            onSelect,
            onRemove,
            formatMessage: intlFunctions().formatMessage,
          })}
        </>
      );
      expect(container.querySelector(".m-remove-lang")).not.toBeInTheDocument();
    });

    it("selects the next language when first one is removed", () => {
      const { container } = renderWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en", "cs"],
            selectedLanguage: "en",
            onSelect,
            onRemove,
            formatMessage: intlFunctions().formatMessage,
          })}
        </>
      );
      fireEvent.click(container.querySelectorAll(".m-remove-lang")[0]);
      expect(onRemove).toHaveBeenCalledWith("en");
      expect(onSelect).toHaveBeenCalledWith("cs");
    });

    it("selects the preceding language when the language with non-zero index is removed", () => {
      const { container } = renderWithIntl(
        <>
          {renderRemovableLanguages({
            languages: ["en", "cs"],
            selectedLanguage: "en",
            onSelect,
            onRemove,
            formatMessage: intlFunctions().formatMessage,
          })}
        </>
      );
      fireEvent.click(container.querySelectorAll(".m-remove-lang")[1]);
      expect(onRemove).toHaveBeenCalledWith("cs");
      expect(onSelect).toHaveBeenCalledWith("en");
    });
  });
});
