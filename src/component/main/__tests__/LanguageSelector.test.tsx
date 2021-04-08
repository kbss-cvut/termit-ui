import * as React from "react";
import { mount, shallow } from "enzyme";
import { LanguageSelector } from "../LanguageSelector";
import Constants from "../../../util/Constants";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";

describe("Language selector", () => {
  let switchLanguage: (lang: string) => void;

  beforeEach(() => {
    switchLanguage = jest.fn();
  });

  it("renders selected language with flag", () => {
    const selectedLanguage = Constants.LANG.EN;
    const wrapper = mount(
      <LanguageSelector
        fixed={true}
        authenticated={true}
        language={selectedLanguage.locale}
        switchLanguage={switchLanguage}
        {...intlFunctions()}
      />
    );
    const element = wrapper.find('a[name="language-selector"]');
    expect(element).toBeDefined();
    expect(element.find("img").prop("src")).toBe(Constants.LANG.EN.flag);
    expect(element.text().trim()).toEqual(Constants.LANG.EN.label);
  });

  it("renders dropdown with classes *-public and *-fixed if !authenticated && fixed", () => {
    const selectedLanguage = Constants.LANG.EN;
    const wrapper = mount(
      <LanguageSelector
        fixed={true}
        authenticated={false}
        language={selectedLanguage.locale}
        switchLanguage={switchLanguage}
        {...intlFunctions()}
      />
    );
    const element = wrapper.find(
      ".language-selector-public.language-selector-fixed"
    );
    expect(element).toBeDefined();
  });

  it("renders dropdown without classes *-public and *-fixed if authenticated && !fixed", () => {
    const selectedLanguage = Constants.LANG.EN;
    const wrapper = mount(
      <LanguageSelector
        fixed={false}
        authenticated={true}
        language={selectedLanguage.locale}
        switchLanguage={switchLanguage}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(".language-selector-public").length).toBe(0);
    expect(wrapper.find(".language-selector-fixed").length).toBe(0);
  });

  it("changes active language to specified value when language is selected", () => {
    const wrapper = shallow(
      <LanguageSelector
        fixed={true}
        authenticated={true}
        language={Constants.LANG.EN.locale}
        switchLanguage={switchLanguage}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as LanguageSelector).onSelect(Constants.LANG.CS.locale);
    expect(switchLanguage).toHaveBeenCalledWith(Constants.LANG.CS.locale);
  });

  it("does not emit action when already active language selector is clicked - Czech", () => {
    const wrapper = shallow(
      <LanguageSelector
        fixed={true}
        authenticated={true}
        language={Constants.LANG.CS.locale}
        switchLanguage={switchLanguage}
        {...intlFunctions()}
      />
    );
    (wrapper.instance() as LanguageSelector).onSelect(Constants.LANG.CS.locale);
    expect(switchLanguage).not.toHaveBeenCalled();
  });
});
