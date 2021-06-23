import * as React from "react";
import Legend from "./Legend";
import { Button, Card, CardBody, CardHeader, Collapse } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import classNames from "classnames";
import BrowserStorage from "../../util/BrowserStorage";
import Constants from "../../util/Constants";

const LegendToggle = () => {
  const [showLegend, setShowLegend] = React.useState(
    BrowserStorage.get(Constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY, "true") ===
      "true"
  );
  const { i18n } = useI18n();
  const toggle = () => {
    setShowLegend(!showLegend);
    BrowserStorage.set(
      Constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY,
      String(!showLegend)
    );
  };
  return (
    <>
      <Collapse isOpen={showLegend}>
        <Card
          className={classNames("legend", "mb-0", {
            "legend-scrolled": window.pageYOffset > 0,
          })}
        >
          <CardHeader className="py-2">
            {i18n("annotator.legend.title")}
          </CardHeader>
          <CardBody>
            <Legend />
          </CardBody>
        </Card>
      </Collapse>
      <Button
        color="primary"
        size="sm"
        onClick={toggle}
        className="legend-button"
      >
        {i18n(`annotator.legend.toggle.${!showLegend ? "show" : "hide"}`)}
      </Button>
    </>
  );
};

export default LegendToggle;
