import LanguageSelector from "../LanguageSelector";
import Constants from "../../../util/Constants";
import * as Redux from "react-redux";
import * as SyncActions from "../../../action/SyncActions";
import { DropdownItem } from "reactstrap";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../../action/SyncActions", () => ({
  ...jest.requireActual("../../../action/SyncActions"),
  switchLanguage: jest.fn(),
}));

describe("Language selector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders selected language with flag", () => {
    const selectedLanguage = Constants.LANG.EN.locale;
    jest.spyOn(Redux, "useSelector").mockReturnValue(selectedLanguage);
    const wrapper = mountWithIntl(
      <LanguageSelector fixed={true} authenticated={true} />
    );
    const element = wrapper.find('a[name="language-selector"]');
    expect(element).toBeDefined();
    expect(element.find("img").prop("src")).toBe(Constants.LANG.EN.flag);
    expect(element.text().trim()).toEqual(Constants.LANG.EN.label);
  });

  it("renders dropdown with classes *-public and *-fixed if !authenticated && fixed", () => {
    const selectedLanguage = Constants.LANG.EN.locale;
    jest.spyOn(Redux, "useSelector").mockReturnValue(selectedLanguage);
    const wrapper = mountWithIntl(
      <LanguageSelector fixed={true} authenticated={false} />
    );
    const element = wrapper.find(
      ".language-selector-public.language-selector-fixed"
    );
    expect(element).toBeDefined();
  });

  it("renders dropdown without classes *-public and *-fixed if authenticated && !fixed", () => {
    const selectedLanguage = Constants.LANG.EN.locale;
    jest.spyOn(Redux, "useSelector").mockReturnValue(selectedLanguage);
    const wrapper = mountWithIntl(
      <LanguageSelector fixed={false} authenticated={true} />
    );
    expect(wrapper.find(".language-selector-public").length).toBe(0);
    expect(wrapper.find(".language-selector-fixed").length).toBe(0);
  });

  it("changes active language to specified value when language is selected", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    jest.spyOn(Redux, "useDispatch").mockReturnValue(jest.fn());
    const wrapper = mountWithIntl(
      <LanguageSelector fixed={true} authenticated={true} />
    );
    const dropdownItems = wrapper.find(DropdownItem);
    dropdownItems
      .filterWhere(
        (item) => item.prop("name") && item.prop("name").endsWith("cs")
      )
      .simulate("click");
    expect(SyncActions.switchLanguage).toHaveBeenCalledWith(Constants.LANG.CS);
  });

  it("does not emit action when already active language selector is clicked - Czech", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    const wrapper = mountWithIntl(
      <LanguageSelector fixed={true} authenticated={true} />
    );
    const dropdownItems = wrapper.find(DropdownItem);
    dropdownItems
      .filterWhere(
        (item) => item.prop("name") && item.prop("name").endsWith("en")
      )
      .simulate("click");
    expect(SyncActions.switchLanguage).not.toHaveBeenCalled();
  });
});
