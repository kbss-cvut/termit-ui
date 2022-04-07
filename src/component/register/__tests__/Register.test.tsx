import { Register } from "../Register";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import ActionType, { AsyncFailureAction } from "../../../action/ActionType";
import SecurityUtils from "../../../util/SecurityUtils";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

jest.mock("../../../util/Routing");
jest.mock("../../../util/Ajax");
jest.mock("../../../util/SecurityUtils");

describe("Registration", () => {
  let register: ({}) => Promise<AsyncFailureAction>;

  beforeEach(() => {
    register = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ type: ActionType.LOGIN }));
  });

  it("clears potentially existing JWT on mount", async () => {
    mountWithIntl(
      <MemoryRouter>
        <Register loading={false} register={register} {...intlFunctions()} />
      </MemoryRouter>
    );
    await act(async () => {
      await flushPromises();
    });
    expect(SecurityUtils.clearToken).toHaveBeenCalled();
  });
});
