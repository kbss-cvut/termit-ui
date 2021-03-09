import * as React from "react";
import {Button} from "reactstrap";
import {IconContext} from "react-icons";
import {GoScreenFull, GoScreenNormal} from "react-icons/go";
import {useI18n} from "../hook/useI18n";

/**
 * A button to turn on/turn off fullscreen
 */
interface Props {
    /**
     * Indicator of being fullscreen. If true, the button should render as Exit fullscreen and vice versa.
     */
    isFullscreen: boolean,

    /**
     * An action to call upon the button click.
     */
    toggleFullscreen: () => void
}

export const FullscreenButton: React.FC<Props> = props => {
    const {i18n} = useI18n();
    return <Button
        key="btnFullscreen"
        color="lightgrey"
        size="md"
        onClick={props.toggleFullscreen}
        title={i18n(props.isFullscreen ? "fullscreen.exit" : "fullscreen.enter")}>
        <IconContext.Provider value={{color: "black", className: "global-class-name"}}>
            {props.isFullscreen ? <GoScreenNormal/> : <GoScreenFull/>}
        </IconContext.Provider>
    </Button>;
}

export default FullscreenButton;
