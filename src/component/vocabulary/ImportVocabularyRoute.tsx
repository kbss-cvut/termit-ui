import * as React from "react";
import IfUserIsEditor from "../authorization/IfUserIsEditor";
import ImportVocabularyPage from "./ImportVocabularyPage";

const ImportVocabularyRoute: React.FC = () => (
  <IfUserIsEditor>
    <ImportVocabularyPage />
  </IfUserIsEditor>
);

export default ImportVocabularyRoute;
