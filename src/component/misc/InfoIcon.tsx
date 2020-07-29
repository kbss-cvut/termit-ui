import * as React from "react";
import {GoInfo} from "react-icons/go";
import {UncontrolledTooltip} from "reactstrap";
import {Placement} from "popper.js";
import "./InfoIcon.scss";
import classNames from "classnames";

interface InfoIconProps {
    id: string;     // Id of the icon element, necessary for correct tooltip display
    text: string;   // Info message to show
    placement?: Placement; // Where to display the tooltip (relative to the icon). Defaults to "right"
    className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = (props) => {
    const cls = classNames("info-icon", props.className);
    return <>
        <GoInfo id={props.id} className={cls}/>
        <UncontrolledTooltip target={props.id} placement={props.placement}>
            {props.text}
        </UncontrolledTooltip>
    </>;
};

InfoIcon.defaultProps = {
    placement: "right"
};

export default InfoIcon;
