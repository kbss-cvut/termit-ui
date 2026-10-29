import React from "react";
import { FaCamera } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import { UncontrolledTooltip } from "reactstrap";
import "./SnapshotIcon.scss";

const SnapshotIcon: React.FC<{
  assetType: string;
  id: string;
  messageKey?: string;
}> = ({ assetType, id, messageKey = "snapshot.message" }) => {
  const { i18n, formatMessage } = useI18n();

  return (
    <>
      <FaCamera id={id} className="text-primary mr-1 mb-1" />
      <UncontrolledTooltip
        id={`${id}-tooltip`}
        placement="right"
        target={id}
        fade={true}
      >
        {formatMessage(messageKey, {
          type: i18n(assetType).toLowerCase(),
        })}
      </UncontrolledTooltip>
    </>
  );
};

export default SnapshotIcon;
