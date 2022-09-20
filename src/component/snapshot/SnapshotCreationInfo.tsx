import React from "react";
import { SupportsSnapshots } from "../../model/Snapshot";
import { FormattedDate, FormattedTime } from "react-intl";
import { useI18n } from "../hook/useI18n";

const SnapshotCreationInfo: React.FC<{ asset: SupportsSnapshots }> = ({
  asset,
}) => {
  const { i18n } = useI18n();
  if (!asset.isSnapshot()) {
    return null;
  }
  if (!asset.snapshotCreated()) {
    return null;
  }
  const createdDate = new Date(Date.parse(asset.snapshotCreated()!));
  return (
    <>
      <span
        id="snapshot-created"
        className="text-muted italics ml-1"
        title={i18n("snapshots.created")}
      >
        ({i18n("snapshot.label.short")}
        &nbsp;
        <FormattedDate value={createdDate} />{" "}
        <FormattedTime value={createdDate} />)
      </span>
    </>
  );
};

export default SnapshotCreationInfo;
