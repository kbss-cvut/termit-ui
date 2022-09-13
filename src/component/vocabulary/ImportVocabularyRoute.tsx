import * as React from "react";
import IfUserIsEditor from "../authorization/IfUserIsEditor";
import ImportVocabularyPage from "./ImportVocabularyPage";

const ImportVocabularyRoute: React.FC = () => (
  <IfUserIsEditor renderUnauthorizedAlert={true}>
    <ImportVocabularyPage />
  </IfUserIsEditor>
);

export default ImportVocabularyRoute;
