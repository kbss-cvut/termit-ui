import { Register } from "../Register";
import SecurityUtils from "../../../util/SecurityUtils";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";

vi.mock("../../../util/Routing");
vi.mock("../../../util/Ajax");
vi.mock("../../../util/SecurityUtils");

describe("Registration", () => {
  it("clears potentially existing JWT on mount", () => {
    renderWithIntl(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(SecurityUtils.clearToken).toHaveBeenCalled();
  });
});
