import { FooterMenu } from "../FooterMenu";
import {
  mockStore,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { LanguageSelector } from "../../main/LanguageSelector";

describe("FooterMenu", () => {
  it("renders component correctly", () => {
    mockStore.getState().sidebarExpanded = true;
    const wrapper = mountWithIntl(<FooterMenu fixed={true} />);

    expect(wrapper.find("div").find(LanguageSelector).length).toBe(1);
  });
});
