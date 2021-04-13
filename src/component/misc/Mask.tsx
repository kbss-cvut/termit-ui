import * as React from "react";
import classNames from "classnames";
import { ClipLoader } from "react-spinners";
import "./Mask.scss";
import { useI18n } from "../hook/useI18n";

export interface MaskProps {
  text?: string;
  withoutText?: boolean;
  classes?: string;
}

const Mask: React.FC<MaskProps> = (props) => {
  const { i18n } = useI18n();
  const containerClasses = classNames("spinner-container", {
    "without-text": props.withoutText,
  });
  const text = props.text ? props.text : i18n("please-wait");
  return (
    <div className={props.classes ? props.classes : "mask"}>
      <div className={containerClasses}>
        <div style={{ width: 32, height: 32, margin: "auto" }}>
          <ClipLoader color="#057fa5" size={32} />
        </div>
        {!props.withoutText && <div className="spinner-message">{text}</div>}
      </div>
    </div>
  );
};

Mask.defaultProps = {
  classes: "mask",
  withoutText: false,
};

export default Mask;
