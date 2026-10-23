import LanguageSelector from "../LanguageSelector";
import Constants from "../../../util/Constants";
import * as Redux from "react-redux";
import * as SyncActions from "../../../action/SyncActions";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { fireEvent } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

vi.mock("../../../action/SyncActions", () => ({
  ...vi.importActual("../../../action/SyncActions"),
  switchLanguage: vi.fn(),
}));

describe("Language selector", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function renderSelector(fixed: boolean, authenticated: boolean) {
    return renderWithIntl(
      <LanguageSelector fixed={fixed} authenticated={authenticated} />
    );
  }

  function toggle(): HTMLElement {
    return document.querySelector('[name="language-selector"]') as HTMLElement;
  }

  function dropdownItem(isoCode: string): HTMLElement {
    return document.querySelector(
      `[name="language-selector.${isoCode}"]`
    ) as HTMLElement;
  }

  it("renders selected language with flag", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    renderSelector(true, true);
    const element = toggle();
    expect(element).toBeInTheDocument();
    const img = element.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("src", Constants.LANG.EN.flag);
    expect(element.textContent!.trim()).toEqual(Constants.LANG.EN.label);
  });

  it("renders dropdown with classes *-public and *-fixed if !authenticated && fixed", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    const { container } = renderSelector(true, false);
    expect(
      container.querySelector(
        ".language-selector-public.language-selector-fixed"
      )
    ).toBeInTheDocument();
  });

  it("renders dropdown without classes *-public and *-fixed if authenticated && !fixed", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    const { container } = renderSelector(false, true);
    expect(
      container.querySelector(".language-selector-public")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".language-selector-fixed")
    ).not.toBeInTheDocument();
  });

  it("changes active language to specified value when language is selected", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    vi.spyOn(Redux, "useDispatch").mockReturnValue(vi.fn());
    renderSelector(true, true);
    fireEvent.click(dropdownItem("cs"));
    expect(SyncActions.switchLanguage).toHaveBeenCalledWith(Constants.LANG.CS);
  });

  it("does not emit action when already active language selector is clicked - Czech", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.LANG.EN.locale);
    renderSelector(true, true);
    fireEvent.click(dropdownItem("en"));
    expect(SyncActions.switchLanguage).not.toHaveBeenCalled();
  });
});
