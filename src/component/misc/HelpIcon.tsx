import * as React from "react";
import {InfoIconProps} from "./InfoIcon";
import classNames from "classnames";
import {FaQuestionCircle} from "react-icons/fa";
import {Button, Popover, PopoverBody, PopoverHeader} from "reactstrap";
import "./InfoIcon.scss";
import {useI18n} from "../hook/useI18n";

const HelpIcon: React.FC<InfoIconProps> = props => {
    const cls = classNames("info-icon", "help-icon", props.className);
    const {i18n} = useI18n();
    const [open, setOpen] = React.useState(false);
    const [pinned, setPinned] = React.useState(false);
    const show = () => setOpen(true);
    const mouseOut = () => {
        if (!pinned) {
            setOpen(false);
        }
    }
    const onClick = () => {
        if (!pinned) {
            setPinned(true);
            setOpen(true);
        } else {
            setPinned(false);
            setOpen(false);
        }
    };

    return <>
        <FaQuestionCircle id={props.id} className={cls} onClick={onClick} onMouseOver={show} onMouseOut={mouseOut}/>
        <Popover target={props.id} placement={props.placement} isOpen={open}>
            <PopoverHeader>
                {i18n("help.title")}
                <Button onClick={onClick} close={true} className="mt-1"/>
            </PopoverHeader>
            <PopoverBody>
                {props.text}
            </PopoverBody>
        </Popover>
    </>;
}

export default HelpIcon;
