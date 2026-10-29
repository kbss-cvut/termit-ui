import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router-dom";
import { MainView } from "../MainView";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { routingProps } from "../../../__tests__/environment/TestUtil";

vi.mock("../Sidebar", () => ({ default: () => null }));
vi.mock("../Dashboard", () => ({ default: () => null }));
vi.mock("../../search/NavbarSearch", () => ({ default: () => null }));
vi.mock("../../search/label/NavbarSearch", () => ({ default: () => null }));
vi.mock("../../search/SearchListenerHelper", () => ({ default: () => null }));
vi.mock("../../breadcrumb/Breadcrumbs", () => ({ default: () => null }));
vi.mock("../../message/Messages", () => ({ default: () => null }));
vi.mock("../../footer/Footer", () => ({ default: () => null }));

describe("Public MainView", () => {
  let changeView: () => void;
  let loadConfiguration: () => void;
  let loadTermTypes: () => void;

  beforeEach(() => {
    changeView = vi.fn();
    loadConfiguration = vi.fn();
    loadTermTypes = vi.fn();
  });

  it("loads configuration on mount", () => {
    renderWithIntl(
      <MemoryRouter>
        <MainView
          sidebarExpanded={false}
          desktopView={true}
          changeView={changeView}
          loadConfiguration={loadConfiguration}
          loadTermStates={loadTermTypes}
          {...intlFunctions()}
          {...routingProps()}
        />
      </MemoryRouter>
    );
    expect(loadConfiguration).toHaveBeenCalled();
    expect(loadTermTypes).toHaveBeenCalled();
  });
});
