import { shallow } from "enzyme";
import { MainView } from "../MainView";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { routingProps } from "../../../__tests__/environment/TestUtil";

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
    shallow(
      <MainView
        sidebarExpanded={false}
        desktopView={true}
        changeView={changeView}
        loadConfiguration={loadConfiguration}
        loadTermStates={loadTermTypes}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(loadConfiguration).toHaveBeenCalled();
    expect(loadTermTypes).toHaveBeenCalled();
  });
});
