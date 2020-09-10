import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Header from "../main/Header";
import {Jumbotron} from "reactstrap";
import {injectIntl} from "react-intl";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";

interface WorkspaceNotLoadedProps extends HasI18n {
    loading: boolean;
}

const WorkspaceNotLoaded: React.FC<WorkspaceNotLoadedProps> = props => {
    const {i18n, loading} = props;
    const msg = loading ? "workspace.loading" : "workspace.current.empty";
    return <div id="workspace-not-loaded" className="wrapper center main-container">
        <Header showBreadcrumbs={false}/>
        <Jumbotron>
            <h1>{i18n(msg)}</h1>
        </Jumbotron>
    </div>;
}

export default connect((state: TermItState) => ({loading: state.loading}))(injectIntl(withI18n(WorkspaceNotLoaded)));
