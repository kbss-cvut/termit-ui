import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { injectIntl } from "react-intl";
import Legend from "./Legend";
import { Button, Card, CardBody, Collapse } from "reactstrap";

interface LegendToggleState {
  showLegend: boolean;
}

class LegendToggle extends React.Component<HasI18n, LegendToggleState> {
  public constructor(props: HasI18n) {
    super(props);
    this.state = {
      showLegend: true,
    };
  }

  public shouldComponentUpdate(
    nextProps: Readonly<HasI18n>,
    nextState: Readonly<LegendToggleState>,
    nextContext: any
  ): boolean {
    return (
      nextState.showLegend !== this.state.showLegend ||
      nextProps.locale !== this.props.locale
    );
  }

  private toggleLegend = () => {
    this.setState({ showLegend: !this.state.showLegend });
  };

  public render() {
    return (
      <>
        <Collapse isOpen={this.state.showLegend}>
          <Card className="legend mb-0">
            <CardBody>
              <Legend />
            </CardBody>
          </Card>
        </Collapse>
        <Button
          color="primary"
          size="sm"
          onClick={this.toggleLegend}
          className="legend-button"
        >
          {!this.state.showLegend
            ? this.props.i18n("annotator.legend.toggle.show")
            : this.props.i18n("annotator.legend.toggle.hide")}
        </Button>
      </>
    );
  }
}

export default injectIntl(withI18n(LegendToggle));
