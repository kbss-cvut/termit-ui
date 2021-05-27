import { shallow } from "enzyme";
import { MainView } from "../MainView";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { routingProps } from "../../../__tests__/environment/TestUtil";

describe("Public MainView", () => {
  let changeView: () => void;
  let loadConfiguration: () => void;

  beforeEach(() => {
    changeView = jest.fn();
    loadConfiguration = jest.fn();
  });

  it("loads configuration on mount", () => {
    shallow(
      <MainView
        sidebarExpanded={false}
        desktopView={true}
        changeView={changeView}
        loadConfiguration={loadConfiguration}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(loadConfiguration).toHaveBeenCalled();
  });
});
