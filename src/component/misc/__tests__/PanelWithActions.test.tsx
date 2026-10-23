import { renderWithIntl } from "../../../__tests__/environment/Environment";
import PanelWithActions from "../PanelWithActions";
import { Button } from "reactstrap";

describe("Panel With Actions", () => {
  it("Panel heading contains all actions and no other", () => {
    const actions = [<Button key="b1" />, <Button key="b2" />];
    const { container } = renderWithIntl(
      <PanelWithActions title={""} actions={actions}>
        <div>Test</div>
      </PanelWithActions>
    );
    expect(container.querySelectorAll(".card-header button").length).toEqual(2);
  });
});
