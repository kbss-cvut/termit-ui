import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import AccessLevel, { hasAccess } from "../../../model/acl/AccessLevel";
import { IfAuthorized } from "react-authorization";

/**
 * Renders the specified children only if the specified vocabulary is editable and the current user has the required access level to it.
 */
const IfVocabularyActionAuthorized: React.FC<{
  vocabulary: Vocabulary;
  requiredAccessLevel: AccessLevel;
  unauthorized?: React.ReactNode | null;
}> = ({ vocabulary, requiredAccessLevel, unauthorized, children }) => {
  return (
    <IfAuthorized
      isAuthorized={
        hasAccess(requiredAccessLevel, vocabulary.accessLevel) &&
        vocabulary.isEditable()
      }
      unauthorized={unauthorized}
    >
      {children}
    </IfAuthorized>
  );
};

export default IfVocabularyActionAuthorized;
