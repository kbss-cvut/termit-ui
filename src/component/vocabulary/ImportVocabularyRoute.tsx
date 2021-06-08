import * as React from "react";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import ImportVocabularyPage from "./ImportVocabularyPage";

const ImportVocabularyRoute: React.FC = () => (
    <IfUserAuthorized>
      <ImportVocabularyPage />
    </IfUserAuthorized>
  );

export default ImportVocabularyRoute;
