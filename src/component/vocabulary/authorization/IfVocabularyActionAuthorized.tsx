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
  mode?: "edit" | "remove";
}> = ({
  vocabulary,
  requiredAccessLevel,
  unauthorized,
  mode = "edit",
  children,
}) => {
  return (
    <IfAuthorized
      isAuthorized={isVocabularyActionAuthorized(
        vocabulary,
        requiredAccessLevel,
        mode
      )}
      unauthorized={unauthorized}
    >
      {children}
    </IfAuthorized>
  );
};

export function isVocabularyActionAuthorized(
  vocabulary: Vocabulary,
  requiredAccessLevel: AccessLevel,
  mode?: "edit" | "remove"
): boolean {
  return (
    hasAccess(requiredAccessLevel, vocabulary.accessLevel) &&
    (mode !== "edit" || vocabulary.isEditable())
  );
}

export default IfVocabularyActionAuthorized;
