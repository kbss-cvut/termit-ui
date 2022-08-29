import React from "react";
import Asset from "../../model/Asset";
import { SupportsSnapshots } from "../../model/Snapshot";
import { GoDeviceCamera } from "react-icons/go";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import { UncontrolledTooltip } from "reactstrap";

interface SnapshotIconProps {
  asset: Asset & SupportsSnapshots;
}

const SnapshotIcon: React.FC<SnapshotIconProps> = ({ asset }) => {
  const { i18n, formatMessage } = useI18n();
  if (!asset || !asset.isSnapshot()) {
    return null;
  }
  return (
    <>
      <GoDeviceCamera id="snapshot-icon" className="mr-1 mb-1" />
      <UncontrolledTooltip
        id="snapshot-icon-tooltip"
        placement="right"
        target="snapshot-icon"
        fade={true}
      >
        {formatMessage("snapshot.message", {
          type: i18n(Utils.getAssetTypeLabelId(asset)).toLowerCase(),
        })}
      </UncontrolledTooltip>
    </>
  );
};

export default SnapshotIcon;
