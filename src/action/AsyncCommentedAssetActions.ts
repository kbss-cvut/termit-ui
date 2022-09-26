import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import { ErrorData } from "../model/ErrorInfo";
import RecentlyCommentedAsset, {
  CONTEXT as RECENTLY_COMMENTED_ASSET_CONTEXT,
  RecentlyCommentedAssetData,
} from "../model/RecentlyCommentedAsset";

export function loadLastCommentedAssets(pageNo: number, pageSize: number) {
  return loadLastCommentedAssetList(
    ActionType.LOAD_LAST_COMMENTED,
    "/assets/last-commented",
    pageNo,
    pageSize
  );
}

export function loadLastCommentedInReactionToMine(
  pageNo: number,
  pageSize: number
) {
  return loadLastCommentedAssetList(
    ActionType.LOAD_LAST_COMMENTED_IN_REACTION_TO_MINE,
    "/assets/last-commented-in-reaction-to-mine",
    pageNo,
    pageSize
  );
}

export function loadMyLastCommented(pageNo: number, pageSize: number) {
  return loadLastCommentedAssetList(
    ActionType.LOAD_MY_LAST_COMMENTED,
    "/assets/my-last-commented",
    pageNo,
    pageSize
  );
}

function loadLastCommentedAssetList(
  at: string,
  endpoint: string,
  pageNo: number,
  pageSize: number
) {
  const action = {
    type: at,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      Constants.API_PREFIX + endpoint,
      param("size", pageSize.toString()).param("page", pageNo.toString())
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RecentlyCommentedAssetData>(
          data,
          RECENTLY_COMMENTED_ASSET_CONTEXT
        )
      )
      .then((data: RecentlyCommentedAssetData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((item) => new RecentlyCommentedAsset(item));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}
