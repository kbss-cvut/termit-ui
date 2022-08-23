import React from "react";
import Vocabulary, { VocabularyData } from "../../../model/Vocabulary";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { IfAuthorized } from "react-authorization";
import { isAssetEditable } from "../../../util/Authorization";

const IfVocabularyEditAuthorized: React.FC<{
  vocabulary: Vocabulary | VocabularyData;
}> = ({ vocabulary, children }) => {
  const user = useSelector((state: TermItState) => state.user);

  return (
    <IfAuthorized isAuthorized={() => isAssetEditable(vocabulary, user)}>
      {children}
    </IfAuthorized>
  );
};

export default IfVocabularyEditAuthorized;
