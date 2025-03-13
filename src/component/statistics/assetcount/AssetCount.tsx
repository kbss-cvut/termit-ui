import * as React from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { trackPromise } from "react-promise-tracker";
import { loadAssetCountStatistics } from "../../../action/AsyncStatisticsActions";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";

export type CountableAssetType = "TERM" | "VOCABULARY" | "USER";

const AssetCount: React.FC<{ assetType: CountableAssetType }> = ({
  assetType,
}) => {
  const [count, setCount] = React.useState<number | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(
      dispatch(loadAssetCountStatistics(assetType)),
      `count-${assetType}`
    ).then(setCount);
  }, [assetType, dispatch]);

  return (
    <h2>
      <PromiseTrackingMask area={`count-${assetType}`} />
      {count ? count : "N/A"}
    </h2>
  );
};

export default AssetCount;
