import React from "react";
import RdfsResource from "../../../model/RdfsResource";
import { useI18n } from "../../hook/useI18n";
import { Alert } from "reactstrap";
import VocabularyLink from "../../vocabulary/VocabularyLink";
import Vocabulary from "../../../model/Vocabulary";

const ManagedAssets: React.FC<{ managedAssets: RdfsResource[] }> = ({
  managedAssets,
}) => {
  const { i18n } = useI18n();
  if (managedAssets.length === 0) {
    return null;
  }
  return (
    <Alert color="warning">
      {i18n("administration.users.role.managedAssetsNotEmpty")}
      <ul className="mb-0">
        {managedAssets.map((a) => (
          <li key={a.iri}>
            <VocabularyLink
              vocabulary={new Vocabulary({ iri: a.iri, label: a.label! })}
              className="alert-link"
            />
          </li>
        ))}
      </ul>
    </Alert>
  );
};

export default ManagedAssets;
