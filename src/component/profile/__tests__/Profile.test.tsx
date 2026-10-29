import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { Profile } from "../Profile";
import User from "../../../model/User";
import { AsyncAction } from "../../../action/ActionType";
import Generator from "../../../__tests__/environment/Generator";
import { i18n, intlFunctions } from "../../../__tests__/environment/IntlUtil";
import * as OidcUtils from "../../../util/OidcUtils";
import * as Constants from "../../../util/Constants";
import * as Redux from "react-redux";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

describe("Profile", () => {
  let updateProfile: (user: User) => Promise<AsyncAction>;
  let user: User;

  beforeEach(() => {
    updateProfile = vi.fn().mockImplementation(() => Promise.resolve({}));
    user = Generator.generateUser();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(
      vi.fn().mockResolvedValue([])
    );
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderProfile() {
    await act(async () => {
      renderWithIntl(
        <Profile
          updateProfile={updateProfile}
          user={user}
          {...intlFunctions()}
        />
      );
    });
  }

  it("correctly renders component if !this.state.edit", async () => {
    await renderProfile();
    expect(
      screen.getByRole("button", { name: i18n("edit") })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: i18n("profile.change-password") })
    ).toBeInTheDocument();
    expect(screen.getByText(user.firstName)).toBeInTheDocument();
    expect(screen.getByText(user.lastName)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n("save") })
    ).not.toBeInTheDocument();
  });

  it("correctly renders component if this.state.edit", async () => {
    await renderProfile();
    fireEvent.click(screen.getByRole("button", { name: i18n("edit") }));
    await waitFor(() => screen.getByDisplayValue(user.firstName));
    expect(screen.getByDisplayValue(user.firstName)).toHaveValue(
      user.firstName
    );
    expect(screen.getByDisplayValue(user.lastName)).toHaveValue(user.lastName);
    expect(
      screen.getByRole("button", { name: i18n("save") })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n("edit") })
    ).not.toBeInTheDocument();
  });

  it("does not render edit buttons when using OIDC authentication", async () => {
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    await renderProfile();
    expect(
      screen.queryByRole("button", { name: i18n("edit") })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n("profile.change-password") })
    ).not.toBeInTheDocument();
  });

  it("renders link to user profile in auth service when using OIDC authentication", async () => {
    const link = "http://localhost/services/auth/profile";
    vi.spyOn(Constants, "getEnv").mockReturnValue(link);
    vi.spyOn(OidcUtils, "isUsingOidcAuth").mockReturnValue(true);
    await renderProfile();
    expect(
      screen.getByText(i18n("administration.users.oidc"))
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", link);
  });
});
