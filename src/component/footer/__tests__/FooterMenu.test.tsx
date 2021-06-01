import { FooterMenu } from "../FooterMenu";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { LanguageSelector } from "../../main/LanguageSelector";
import * as redux from "react-redux";

describe("FooterMenu", () => {
  it("renders component correctly", () => {
    jest.spyOn(redux, "useSelector").mockReturnValue(true);
    const wrapper = mountWithIntl(<FooterMenu fixed={true} />);

    expect(wrapper.find("div").find(LanguageSelector).length).toBe(1);
  });
});
