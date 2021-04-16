import React from "react";
import { Placement } from "popper.js";
import classNames from "classnames";
import { FaGlobe } from "react-icons/fa";
import { UncontrolledTooltip } from "reactstrap";
import "./InfoIcon.scss";
import { useI18n } from "../hook/useI18n";

export interface MultilingualIconProps {
  id: string; // Id of the icon element, necessary for correct tooltip display
  placement?: Placement; // Where to display the tooltip (relative to the icon). Defaults to "right"
  className?: string;
}

const MultilingualIcon: React.FC<MultilingualIconProps> = (props) => {
  const { i18n } = useI18n();
  const cls = classNames("info-icon", props.className);
  return (
    <>
      <FaGlobe id={props.id} className={cls} />
      <UncontrolledTooltip target={props.id} placement={props.placement}>
        {i18n("multilingual.title")}
      </UncontrolledTooltip>
    </>
  );
};

MultilingualIcon.defaultProps = {
  placement: "right",
};

export default MultilingualIcon;
