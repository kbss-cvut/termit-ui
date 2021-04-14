import * as React from "react";
import Legend from "./Legend";
import { Button, Card, CardBody, CardHeader, Collapse } from "reactstrap";
import { useI18n } from "../hook/useI18n";

const LegendToggle = () => {
  const [showLegend, setShowLegend] = React.useState(true);
  const { i18n } = useI18n();
  const toggle = () => setShowLegend(!showLegend);
  return (
    <>
      <Collapse isOpen={showLegend}>
        <Card className="legend mb-0">
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
