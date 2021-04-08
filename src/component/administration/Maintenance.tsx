import * as React from "react";
import {Button, ButtonToolbar} from "reactstrap";
import PanelWithActions from "../misc/PanelWithActions";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {invalidateCaches} from "../../action/AsyncActions";
import {useI18n} from "../hook/useI18n";

interface MaintenanceProps {
    invalidateCache: () => void;
}

export const Maintenance: React.FC<MaintenanceProps> = props => {
    const {invalidateCache} = props;
    const {i18n} = useI18n();
    return (
        <PanelWithActions title={i18n("administration.maintenance.title")}>
            <ButtonToolbar>
                <Button
                    color="primary"
                    size="sm"
                    title={i18n("administration.maintenance.invalidateCaches.tooltip")}
                    onClick={invalidateCache}>
                    {i18n("administration.maintenance.invalidateCaches")}
                </Button>
            </ButtonToolbar>
        </PanelWithActions>
    );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        invalidateCache: () => dispatch(invalidateCaches())
    };
})(Maintenance);
