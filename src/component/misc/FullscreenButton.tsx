import * as React from "react";
import {Button} from "reactstrap";
import {IconContext} from "react-icons";
import {default as withI18n, HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import {GoScreenFull, GoScreenNormal} from "react-icons/go";

/**
 * A button to turn on/turn off fullscreen
 */
interface Props extends HasI18n{
    /**
     * Indicator of being fullscreen. If true, the button should render as Exit fullscreen and vice versa.
     */
    isFullscreen: boolean,

    /**
     * An action to call upon the button click.
     */
    toggleFullscreen: () => void
}

export class FullscreenButton extends React.Component<Props> {
    public render() {
        return (<Button
            key="btnFullscreen"
            color="lightgrey"
            size="md"
            onClick={this.props.toggleFullscreen}
            title={this.props.i18n(this.props.isFullscreen ? "fullscreen.exit" : "fullscreen.enter")}>
            <IconContext.Provider value={{color: "black", className: "global-class-name"}}>
                {this.props.isFullscreen ? <GoScreenNormal/> : <GoScreenFull/>}
            </IconContext.Provider>
        </Button>);
    }
}

export default injectIntl(withI18n(FullscreenButton));
