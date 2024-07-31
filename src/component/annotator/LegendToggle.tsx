import * as React from "react";
import Legend from "./Legend";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Collapse,
  UncontrolledTooltip,
} from "reactstrap";
import { useI18n } from "../hook/useI18n";
import classNames from "classnames";
import BrowserStorage from "../../util/BrowserStorage";
import Constants from "../../util/Constants";
import OutgoingLink from "../misc/OutgoingLink";
import { FaFilter, FaQuestionCircle } from "react-icons/fa";
import TermItState from "../../model/TermItState";
import { useSelector } from "react-redux";

const TOGGLE_BUTTON_ID = "annotator-legend-toggle-button";

const LegendToggle = () => {
  const [showLegend, setShowLegend] = React.useState(
    BrowserStorage.get(Constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY, "true") ===
      "true"
  );
  const isAnyAnnotationHidden = useSelector((state: TermItState) =>
    state.annotatorLegendFilter.isAnyHidden()
  );
  const { i18n, locale } = useI18n();
  const toggle = () => {
    setShowLegend(!showLegend);
    BrowserStorage.set(
      Constants.STORAGE_ANNOTATOR_LEGEND_OPEN_KEY,
      String(!showLegend)
    );
  };

  const renderIcon = () => {
    if (isAnyAnnotationHidden) {
      return <FaFilter className="mr-1" />;
    }

    return <FaQuestionCircle className="mr-1" />;
  };

  const renderTooltip = () => {
    if (isAnyAnnotationHidden) {
      return (
        <UncontrolledTooltip target={TOGGLE_BUTTON_ID} placement={"left-start"}>
          {i18n("annotator.legend.activeFilter.tooltip")}
        </UncontrolledTooltip>
      );
    }

    return null;
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
            <button className="close" onClick={() => toggle()}>
              ×
            </button>
          </CardHeader>
          <CardBody>
            <Legend />
          </CardBody>
          <CardFooter className="d-flex flex-column py-2">
            <span className="small italics">
              {i18n("annotator.legend.annotationHidingHint")}
            </span>
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
        id={TOGGLE_BUTTON_ID}
        color={isAnyAnnotationHidden ? "warning" : "primary"}
        size="sm"
        onClick={toggle}
        className="annotator-action-button legend-toggle-button"
        active={showLegend}
      >
        {renderIcon()}
        {i18n("help.title")}
      </Button>
      {renderTooltip()}
    </>
  );
};

export default LegendToggle;
