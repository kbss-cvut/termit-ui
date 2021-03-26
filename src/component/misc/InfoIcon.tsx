import * as React from "react";
import {FaInfoCircle} from "react-icons/fa";
import {UncontrolledTooltip} from "reactstrap";
import {Placement} from "popper.js";
import "./InfoIcon.scss";
import classNames from "classnames";

export interface InfoIconProps {
    id: string;     // Id of the icon element, necessary for correct tooltip display
    text: string;   // Info message to show
    placement?: Placement; // Where to display the tooltip (relative to the icon). Defaults to "right"
    className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = (props) => {
    const cls = classNames("info-icon", props.className);
    return <>
        <FaInfoCircle id={props.id} className={cls}/>
        <UncontrolledTooltip target={props.id} placement={props.placement}>
            {props.text}
        </UncontrolledTooltip>
    </>;
};

InfoIcon.defaultProps = {
    placement: "right"
};

export default InfoIcon;
