import * as React from "react";
import Workspace from "../../model/Workspace";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";

interface WorkspaceIndicatorProps {
    workspace: Workspace | null;
}

const WorkspaceIndicator: React.FC<WorkspaceIndicatorProps> = props => {
    const {workspace} = props;
    if (!workspace) {
        return null;
    }
    return <FormattedMessage id="workspace.indicator" values={{name: workspace.label}}/>;
}

export default connect((state: TermItState) => ({workspace: state.workspace}))(WorkspaceIndicator);
