import React from "react";
import RdfsResource from "../../../model/RdfsResource";
import { useI18n } from "../../hook/useI18n";
import { Alert } from "reactstrap";
import { getLocalized } from "../../../model/MultilingualString";

const ManagedAssets: React.FC<{ managedAssets: RdfsResource[] }> = ({
  managedAssets,
}) => {
  const { i18n } = useI18n();
  if (managedAssets.length === 0) {
    return null;
  }
  return (
    <Alert color="danger">
      {i18n("administration.users.role.managedAssetsNotEmpty")}
      <ul className="mb-0">
        {managedAssets.map((a) => (
          <li key={a.iri}>{getLocalized(a.label)}</li>
        ))}
      </ul>
    </Alert>
  );
};

export default ManagedAssets;
