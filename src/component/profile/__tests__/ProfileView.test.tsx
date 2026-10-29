import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import ProfileView from "../ProfileView";
import User from "../../../model/User";
import Generator from "../../../__tests__/environment/Generator";

describe("ProfileView", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("correctly renders component with user details", () => {
    renderWithIntl(<ProfileView user={user} />);
    expect(screen.getByText(user.firstName)).toBeInTheDocument();
    expect(screen.getByText(user.lastName)).toBeInTheDocument();
  });
});
