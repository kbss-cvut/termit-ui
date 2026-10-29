import { FunctionComponent } from "react";
import { CollectionIconProps } from "./CollectionSnapshotIcon";
import { useI18n } from "../hook/useI18n";
import AccessLevel from "../../model/acl/AccessLevel";
import AssetReadOnlyIcon from "../authorization/AssetReadOnlyIcon";

export const CollectionReadOnlyIcon: FunctionComponent<CollectionIconProps> = ({
  collection,
  vocabulary,
}) => {
  const { i18n } = useI18n();
  return !collection?.isEditable() ||
    !vocabulary?.isEditable() ||
    vocabulary?.accessLevel === AccessLevel.READ ? (
    <AssetReadOnlyIcon
      explanationId="auth.notEditable.message.readOnly"
      explanationValues={{ type: i18n("type.collection").toLowerCase() }}
      id="collection-read-only-icon"
      className="ml-1"
    />
  ) : null;
};
