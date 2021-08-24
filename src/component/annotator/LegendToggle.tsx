import * as React from "react";
import Legend from "./Legend";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Collapse,
} from "reactstrap";
import { useI18n } from "../hook/useI18n";
import classNames from "classnames";
import BrowserStorage from "../../util/BrowserStorage";
import Constants from "../../util/Constants";
import OutgoingLink from "../misc/OutgoingLink";
import { FaQuestionCircle } from "react-icons/fa";

const LegendToggle = () => {
  const [showLegend, setShowLegend] = React.useState(
    BrowserStorage.get(Constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY, "true") ===
      "true"
  );
  const { i18n, locale } = useI18n();
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
          <CardFooter className="py-2">
            <OutgoingLink
              id="annotator-tutorial-link"
              iri={Constants.ANNOTATOR_TUTORIAL[locale]}
              label={
                <a
                  href={Constants.ANNOTATOR_TUTORIAL[locale]}
                  title={i18n("annotator.tutorial.tooltip")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n("annotator.tutorial.title")}
                </a>
              }
            />
          </CardFooter>
        </Card>
      </Collapse>
      <Button
        color="primary"
        size="sm"
        onClick={toggle}
        className="annotator-action-button"
        active={showLegend}
      >
        <FaQuestionCircle className="mr-1" />
        {i18n("help.title")}
      </Button>
    </>
  );
};

export default LegendToggle;
