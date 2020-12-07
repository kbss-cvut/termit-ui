import * as React from "react";
import Workspace from "../../model/Workspace";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Constants from "../../util/Constants";
import VocabularyUtils from "../../util/VocabularyUtils";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";

interface WorkspaceIndicatorProps extends HasI18n {
    workspace: Workspace | null;
}

function generateControlPanelLink(ws: Workspace, i18n: (id?: string) => string) {
    const iri = VocabularyUtils.create(ws.iri);
    return <a href={`${Constants.CONTROL_PANEL_URL}/workspaces/${iri.fragment}`}
              title={i18n("workspace.indicator.controlPanelLink.tooltip")}>{ws.label}</a>;
}

export const WorkspaceIndicator: React.FC<WorkspaceIndicatorProps> = props => {
    const {workspace, i18n, formatMessage} = props;
    if (!workspace) {
        return null;
    }
    const value = Constants.CONTROL_PANEL_URL ? generateControlPanelLink(workspace, i18n) : workspace.label;
    return <span>{formatMessage("workspace.indicator", {name: value})}</span>;
}

export default connect((state: TermItState) => ({workspace: state.workspace}))(injectIntl(withI18n(WorkspaceIndicator)));
