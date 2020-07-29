import * as React from "react";
import PanelWithActions from "../misc/PanelWithActions";
import FullscreenButton from "./FullscreenButton";
import Fullscreenable, {FullscreenableProps} from "react-fullscreenable";

/**
 * A panel that has an action to become (and cease to be) fullscreen-wide.
 */
interface Props {
    /**
     * Panel header text
     */
    title: string,
    /**
     * An list of additional actions to be shown in the panel heading
     */
    actions: JSX.Element[],
}

class FullscreenablePanelWithActions extends React.Component<Props & FullscreenableProps> {

    public render() {
        const components = [...this.props.actions];
        components.push(<FullscreenButton key="btnFullscreen"
                                          isFullscreen={this.props.isFullscreen}
                                          toggleFullscreen={this.props.toggleFullscreen}/>);
        return <PanelWithActions
            title={this.props.title}
            actions={components}>
            {this.props.children}
        </PanelWithActions>;
    }
}

export default Fullscreenable<Props>()(FullscreenablePanelWithActions);
