import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { Profile } from "../Profile";
import ProfileActionButtons from "../ProfileActionButtons";
import ProfileView from "../ProfileView";
import User from "../../../model/User";
import { AsyncAction } from "../../../action/ActionType";
import Generator from "../../../__tests__/environment/Generator";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import ProfileEditForm from "../ProfileEditForm";
import HeaderWithActions from "../../misc/HeaderWithActions";
import * as OidcUtils from "../../../util/OidcUtils";
import * as Constats from "../../../util/Constants";

describe("Profile", () => {
  let updateProfile: (user: User) => Promise<AsyncAction>;
  let user: User;

  beforeEach(() => {
    updateProfile = jest.fn().mockImplementation(() => Promise.resolve({}));
    user = Generator.generateUser();
  });

  it("correctly renders component if !this.state.edit", () => {
    const wrapper = mountWithIntl(
      <Profile updateProfile={updateProfile} user={user} {...intlFunctions()} />
    );
    (wrapper.find(Profile).instance() as Profile).setState({ edit: false });
    wrapper.update();

    const actionButtons = wrapper
      .find(HeaderWithActions)
      .find(ProfileActionButtons);

    expect(actionButtons.length).toEqual(1);
    expect(wrapper.find(ProfileView).length).toEqual(1);
  });

  it("correctly renders component if this.state.edit", () => {
    const wrapper = mountWithIntl(
      <Profile updateProfile={updateProfile} user={user} {...intlFunctions()} />
    );
    (wrapper.find(Profile).instance() as Profile).setState({ edit: true });
    wrapper.update();

    const actionButtons = wrapper
      .find(HeaderWithActions)
      .find(ProfileActionButtons);

    expect(actionButtons.length).toEqual(1);
    expect(wrapper.find(ProfileEditForm).length).toEqual(1);
  });

  it("does not render edit buttons when using OIDC authentication", () => {
    jest.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    const wrapper = mountWithIntl(
      <Profile updateProfile={updateProfile} user={user} {...intlFunctions()} />
    );
    expect(wrapper.exists(ProfileActionButtons)).toBeFalsy();
  });

  it("renders link to user profile in auth service when using OIDC authentication", () => {
    const link = "http://localhost/services/auth/profile";
    jest.spyOn(Constats, "getEnv").mockReturnValue(link);
    jest.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    const wrapper = mountWithIntl(
      <Profile updateProfile={updateProfile} user={user} {...intlFunctions()} />
    );
    expect(wrapper.exists("#oidc-notice")).toBeTruthy();
  });
});
