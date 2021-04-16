import * as React from "react";
import { Badge } from "reactstrap";
import Utils from "../../util/Utils";
import { HasTypes } from "../../model/Asset";
import classNames from "classnames";
import { useI18n } from "../hook/useI18n";

interface ResourceBadgeProps {
  resource?: HasTypes;
  className?: string;
}

const ResourceBadge: React.FC<ResourceBadgeProps> = (
  props: ResourceBadgeProps
) => {
  let typeLabel = props.resource
    ? Utils.getAssetTypeLabelId(props.resource)
    : "type.resource";
  if (!typeLabel) {
    typeLabel = "type.resource";
  }
  const { i18n } = useI18n();
  return (
    <Badge
      color="orange"
      className={classNames("asset-badge", props.className)}
    >
      {i18n(typeLabel)}
    </Badge>
  );
};

export default ResourceBadge;
