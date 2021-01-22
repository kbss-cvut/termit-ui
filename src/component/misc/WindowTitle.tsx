import * as React from "react";
import Constants from "../../util/Constants";
import {Helmet} from "react-helmet";

interface WindowTitleProps {
    title: string;
    appendAppName?: boolean;    // Whether to append application name to the specified title. Defaults to true
}

const WindowTitle: React.FC<WindowTitleProps> = props => <Helmet>
    <title>{props.title}{props.appendAppName && `| ${Constants.APP_NAME}`}</title>
</Helmet>;

WindowTitle.defaultProps = {
    title: "",
    appendAppName: true
};

export default WindowTitle;
