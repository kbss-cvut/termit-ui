import Users from "../Users";
import Generator from "../../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import * as UserActions from "../../../../action/AsyncUserActions";
import UsersTable from "../UsersTable";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import * as Redux from "react-redux";
import * as OidcUtils from "../../../../util/OidcUtils";
import * as Constats from "../../../../util/Constants";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("Users", () => {
  const currentUser = Generator.generateUser();
  const users = [
    Generator.generateUser(),
    Generator.generateUser(),
    currentUser,
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(
      vi.fn().mockResolvedValue({})
    );
  });

  function render() {
    vi.spyOn(Redux, "useSelector")
      .mockReturnValueOnce(users)
      .mockReturnValueOnce(currentUser);
    mockUseI18n();
    return shallow(<Users />);
  }

  it("disables user and reloads all users on finish", () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "disableUser");
    const wrapper = render();

    wrapper.find(UsersTable).prop("disable")(users[0]);
    return Promise.resolve().then(() => {
      expect(UserActions.disableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("enables user and reloads all users on finish", () => {
    vi.spyOn(UserActions, "loadUsers");
    vi.spyOn(UserActions, "enableUser");
    const wrapper = render();

    wrapper.find(UsersTable).prop("enable")(users[0]);
    return Promise.resolve().then(() => {
      expect(UserActions.enableUser).toHaveBeenCalledWith(users[0]);
      expect(UserActions.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  it("renders users table read only when using OIDC authentication", () => {
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    const wrapper = render();
    expect(wrapper.find(UsersTable).prop("readOnly")).toBeTruthy();
  });

  it("renders link to auth service administration when using OIDC authentication", () => {
    const link = "http://localhost/services/auth";
    vi.spyOn(Constats, "getEnv").mockReturnValue(link);
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    vi.spyOn(UserActions, "loadUsers");
    const wrapper = render();
    expect(wrapper.exists("#oidc-notice")).toBeTruthy();
  });
});
