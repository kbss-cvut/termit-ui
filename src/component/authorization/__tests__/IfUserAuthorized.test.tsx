import User from "../../../model/User";
import Generator from "../../../__tests__/environment/Generator";
import IfUserAuthorized from "../IfUserAuthorized";
import * as redux from "react-redux";
import Unauthorized from "../Unauthorized";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../__tests__/environment/Environment";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("IfUserAuthorized", () => {
  let currentUser: User;

  beforeEach(() => {
    currentUser = Generator.generateUser();
    (redux.useSelector as jest.Mock).mockReturnValue(currentUser);
  });

  it("renders children components when current user is not restricted", () => {
    const wrapper = mountWithIntl(
      <IfUserAuthorized>
        <div id="test">Test</div>
      </IfUserAuthorized>
    );
    expect(wrapper.exists("#test")).toBeTruthy();
    expect(wrapper.exists(Unauthorized)).toBeFalsy();
  });

  it("renders unauthorized component when current user is restricted", () => {
    currentUser.types.push(VocabularyUtils.USER_RESTRICTED);
    const wrapper = mountWithIntl(
      <IfUserAuthorized>
        <div id="test">Test</div>
      </IfUserAuthorized>
    );
    expect(wrapper.exists("#test")).toBeFalsy();
    expect(wrapper.exists(Unauthorized)).toBeTruthy();
  });

  it("renders nothing when user is restricted and renderUnauthorizedAlert is false", () => {
    currentUser.types.push(VocabularyUtils.USER_RESTRICTED);
    const wrapper = mountWithIntl(
      <IfUserAuthorized renderUnauthorizedAlert={false}>
        <div id="test">Test</div>
      </IfUserAuthorized>
    );
    expect(wrapper.isEmptyRender()).toBeTruthy();
  });
});
