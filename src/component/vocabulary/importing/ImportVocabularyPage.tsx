import React from "react";
import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import { useI18n } from "../../hook/useI18n";
import HeaderWithActions from "../../misc/HeaderWithActions";
import Tabs from "../../misc/Tabs";
import CreateVocabularyFromExcel from "./CreateVocabularyFromExcel";
import CreateVocabularyFromSkos from "./CreateVocabularyFromSkos";
import CreateVocabularyFromSkosExternal from "./CreateVocabularyFromSkosExternal";

declare type ImportType =
  | "vocabulary.import.type.skos"
  | "vocabulary.import.type.skos-external"
  | "vocabulary.import.type.excel";

const ImportVocabularyPage = () => {
  const { i18n } = useI18n();
  const [activeTab, setActiveTab] = React.useState<ImportType>(
    "vocabulary.import.type.skos"
  );

  return (
    <IfUserIsEditor>
      <HeaderWithActions title={i18n("vocabulary.import.dialog.title")} />
      <Tabs
        activeTabLabelKey={activeTab}
        tabs={{
          "vocabulary.import.type.skos": <CreateVocabularyFromSkos />,
          "vocabulary.import.type.skos-external": (
            <CreateVocabularyFromSkosExternal />
          ),
          "vocabulary.import.type.excel": <CreateVocabularyFromExcel />,
        }}
        changeTab={(k) => setActiveTab(k as ImportType)}
        contentClassName="pt-3"
      />
    </IfUserIsEditor>
  );
};

export default ImportVocabularyPage;
