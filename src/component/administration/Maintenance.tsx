import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar} from "reactstrap";
import PanelWithActions from "../misc/PanelWithActions";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {invalidateCaches} from "../../action/AsyncActions";
import {injectIntl} from "react-intl";

interface MaintenanceProps extends HasI18n {
    invalidateCache: () => void;
}

export const Maintenance: React.FC<MaintenanceProps> = props => {
    const {i18n, invalidateCache} = props;
    return <PanelWithActions title={i18n("administration.maintenance.title")}>
        <ButtonToolbar>
            <Button color="primary" size="sm" title={i18n("administration.maintenance.invalidateCaches.tooltip")}
                    onClick={invalidateCache}>
                {i18n("administration.maintenance.invalidateCaches")}
            </Button>
        </ButtonToolbar>
    </PanelWithActions>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        invalidateCache: () => dispatch(invalidateCaches())
    };
})(injectIntl(withI18n(Maintenance)));
