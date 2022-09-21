import React from "react";
import { GoLock } from "react-icons/go";
import { UncontrolledTooltip } from "reactstrap";
import { useI18n } from "../hook/useI18n";

interface AssetReadOnlyIconProps {
  id: string;
  explanationId: string; // Identifier of the explanatory message
  explanationValues?: { [key: string]: string | number }; // Explanatory message values (e.g., type of asset)
  className?: string;
}

const AssetReadOnlyIcon: React.FC<AssetReadOnlyIconProps> = ({
  className,
  explanationId,
  explanationValues,
  id,
}) => {
  const { formatMessage } = useI18n();
  return (
    <>
      <GoLock id={id} className={className} />
      <UncontrolledTooltip target={id}>
        {formatMessage(explanationId, explanationValues)}
      </UncontrolledTooltip>
    </>
  );
};

AssetReadOnlyIcon.defaultProps = {
  explanationValues: {},
};

export default AssetReadOnlyIcon;
