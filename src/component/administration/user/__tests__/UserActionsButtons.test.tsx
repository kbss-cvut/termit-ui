import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Generator from "../../../../__tests__/environment/Generator";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import User from "../../../../model/User";
import Utils from "../../../../util/Utils";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import UserActionsButtons, { UserActions } from "../UserActionsButtons";
import { vi } from "vitest";

describe("UserRow", () => {
  let user: User;
  let actions: UserActions;

  beforeEach(() => {
    user = Generator.generateUser();
    actions = {
      disable: vi.fn(),
      enable: vi.fn(),
      changeRole: vi.fn(),
    };
    mockUseI18n();
  });

  it("renders disable button for non-disabled user", () => {
    const { container } = render(
      <UserActionsButtons
        user={user}
        currentUser={Generator.generateUser()}
        {...actions}
      />
    );
    expect(
      container.querySelector(`#user-${Utils.hashCode(user.iri)}-disable`)
    ).toBeTruthy();
  });

  it("renders enable button for disabled user", () => {
    user.types.push(VocabularyUtils.USER_DISABLED);
    const { container } = render(
      <UserActionsButtons
        user={user}
        currentUser={Generator.generateUser()}
        {...actions}
      />
    );
    expect(
      container.querySelector(`#user-${Utils.hashCode(user.iri)}-disable`)
    ).toBeFalsy();
    expect(
      container.querySelector(`#user-${Utils.hashCode(user.iri)}-enable`)
    ).toBeTruthy();
  });

  it("invokes disable action when disable button is clicked", async () => {
    const ue = userEvent.setup();
    const { container } = render(
      <UserActionsButtons
        user={user}
        currentUser={Generator.generateUser()}
        {...actions}
      />
    );
    const button = container.querySelector(
      `#user-${Utils.hashCode(user.iri)}-disable`
    ) as HTMLElement;
    expect(button).toBeTruthy();
    await ue.click(button);
    expect(actions.disable).toHaveBeenCalledWith(user);
  });

  it("invokes enable action when enable button is clicked", async () => {
    user.types.push(VocabularyUtils.USER_DISABLED);
    const ue = userEvent.setup();
    const { container } = render(
      <UserActionsButtons
        user={user}
        currentUser={Generator.generateUser()}
        {...actions}
      />
    );
    const button = container.querySelector(
      `#user-${Utils.hashCode(user.iri)}-enable`
    ) as HTMLElement;
    expect(button).toBeTruthy();
    await ue.click(button);
    expect(actions.enable).toHaveBeenCalledWith(user);
  });

  it("does not render action buttons for currently logged-in user", () => {
    const { container } = render(
      <UserActionsButtons user={user} currentUser={user} {...actions} />
    );
    expect(container.querySelector("button")).toBeFalsy();
  });
});
