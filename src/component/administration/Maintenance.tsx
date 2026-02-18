import * as React from "react";
import { Button, ButtonToolbar } from "reactstrap";
import PanelWithActions from "../misc/PanelWithActions";

import { useI18n } from "../hook/useI18n";
import {
  clearLongRunningTasksQueue,
  invalidateCaches,
  reloadFullTextSearch,
} from "../../action/AsyncActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import Constants from "../../util/Constants";

export const Maintenance: React.FC = () => {
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n } = useI18n();

  return (
    <PanelWithActions title={i18n("administration.maintenance.title")}>
      <ButtonToolbar>
        <Button
          color="primary"
          size="sm"
          title={i18n("administration.maintenance.invalidateCaches.tooltip")}
          onClick={() => dispatch(invalidateCaches())}
        >
          {i18n("administration.maintenance.invalidateCaches")}
        </Button>
        <Button
          color="primary"
          size="sm"
          title={i18n(
            "administration.maintenance.clearLongRunningTasksQueue.tooltip"
          )}
          onClick={() => dispatch(clearLongRunningTasksQueue())}
        >
          {i18n("administration.maintenance.clearLongRunningTasksQueue")}
        </Button>
        <Button
          color="primary"
          size="sm"
          title={i18n("administration.maintenance.reloadFTS.tooltip")}
          onClick={() => dispatch(reloadFullTextSearch())}
        >
          {i18n("administration.maintenance.reloadFTS")}
        </Button>
        <a
          href={`${Constants.SERVER_URL}/actuator/sbom/application`}
          target="_blank noopener noreferrer"
          className="align-self-center btn btn-primary btn-sm"
        >
          Software Bill of Materials (SBOM)
        </a>
      </ButtonToolbar>
    </PanelWithActions>
  );
};

export default Maintenance;
