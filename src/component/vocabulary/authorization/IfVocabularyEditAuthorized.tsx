import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { IfAuthorized } from "react-authorization";
import { isAssetEditable } from "../../../util/Authorization";

const IfVocabularyEditAuthorized: React.FC<{
  vocabulary: Vocabulary;
  unauthorized?: React.ReactNode | null;
}> = ({ vocabulary, unauthorized, children }) => {
  const user = useSelector((state: TermItState) => state.user);

  return (
    <IfAuthorized
      isAuthorized={() =>
        isAssetEditable(vocabulary, user) && !vocabulary.isSnapshot()
      }
      unauthorized={unauthorized}
    >
      {children}
    </IfAuthorized>
  );
};

export default IfVocabularyEditAuthorized;
