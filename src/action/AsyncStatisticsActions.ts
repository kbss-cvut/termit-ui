import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import {
  CONTEXT as DISTRIBUTION_CONTEXT,
  DistributionDto,
} from "../model/statistics/DistributionDto";
import JsonLdUtils from "../util/JsonLdUtils";

export function loadTermDistributionStatistics() {
  const action = {
    type: ActionType.LOAD_STATISTICS,
    statistics: "term-distribution",
  };
  return (dispatch: ThunkDispatch) => {
    asyncActionRequest(action, true);
    return Ajax.get(`${Constants.API_PREFIX}/statistics/term-distribution`)
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<DistributionDto>(
          data,
          DISTRIBUTION_CONTEXT
        )
      )
      .then((data: DistributionDto[]) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadAssetCountStatistics(assetType: string) {
  const action = {
    type: ActionType.LOAD_STATISTICS,
    statistics: "asset-count",
  };
  return (dispatch: ThunkDispatch) => {
    asyncActionRequest(action, true);
    return Ajax.get(
      `${Constants.API_PREFIX}/statistics/count`,
      param("assetType", assetType)
    )
      .then((data) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return -1;
      });
  };
}
