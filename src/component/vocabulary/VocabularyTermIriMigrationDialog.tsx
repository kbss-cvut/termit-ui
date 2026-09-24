import IriMigrationDialog, {
  IriMigrationDialogControlProps,
  ResetHandle,
} from "../asset/IriMigrationDialog";
import Vocabulary from "../../model/Vocabulary";
import Term, { TermData } from "../../model/Term";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import Tabs from "../misc/Tabs";
import { Label } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { TermSelector } from "../term/TermSelector";
import Utils from "../../util/Utils";

export interface VocabularyTermIriMigrationDialogProps
  extends IriMigrationDialogControlProps {
  vocabulary: Vocabulary;
}

enum TAB_KEY {
  VOCABULARY = "type.vocabulary",
  TERM = "type.term",
}

const ASSET_TYPE: Record<TAB_KEY, string> = {
  [TAB_KEY.VOCABULARY]: "vocabulary",
  [TAB_KEY.TERM]: "term",
};

const VocabularyTab: FunctionComponent<{ vocabulary: Vocabulary }> = ({
  vocabulary,
}) => {
  const { i18n, locale } = useI18n();

  return (
    <Label>
      {i18n(TAB_KEY.VOCABULARY) + " "}
      {vocabulary.getLabel(locale)}
    </Label>
  );
};

interface TermTabProps {
  vocabulary: Vocabulary;
  selectedTerm: Term | null;
  onSelected: (term: Term | null) => void;
}

const TermTab: FunctionComponent<TermTabProps> = ({
  vocabulary,
  selectedTerm,
  onSelected,
}) => {
  const updateSelectedTerm = (terms: readonly TermData[]) => {
    onSelected(terms[0] != null ? new Term(terms[0]) : null);
  };

  return (
    <TermSelector
      value={Utils.sanitizeArray(selectedTerm)}
      onChange={updateSelectedTerm}
      includeImported={false}
      vocabularyIri={vocabulary.iri}
      disableScopeToggle={true}
      multi={false}
    />
  );
};

const VocabularyTermIriMigrationDialog = ({
  onCancel,
  isVisible,
  vocabulary,
}: VocabularyTermIriMigrationDialogProps) => {
  const { formatMessage, i18n } = useI18n();
  const dialogRef = useRef<ResetHandle | null>(null);
  const [activeTab, setActiveTab] = useState<TAB_KEY>(TAB_KEY.VOCABULARY);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const selectedAsset =
    activeTab === TAB_KEY.VOCABULARY ? vocabulary : selectedTerm;

  useEffect(() => {
    console.debug("reset form", selectedAsset, dialogRef.current);
    dialogRef.current?.resetForm();
  }, [selectedAsset]);

  const onTabChange = (tabKey: string) => {
    if (tabKey === TAB_KEY.VOCABULARY || tabKey === TAB_KEY.TERM) {
      setActiveTab(tabKey);
    }
  };

  return (
    <IriMigrationDialog
      ref={dialogRef}
      title={i18n("vocabulary.migrate.iri.title")}
      confirmationInputLabel={formatMessage(
        "vocabulary.migrate.iri.confirmLabel",
        { assetType: ASSET_TYPE[activeTab] }
      )}
      isVisible={isVisible}
      onCancel={onCancel}
      asset={selectedAsset}
    >
      <Tabs
        activeTabLabelKey={activeTab}
        changeTab={onTabChange}
        contentClassName={"mt-3"}
        tabs={{
          [TAB_KEY.VOCABULARY]: <VocabularyTab vocabulary={vocabulary} />,
          [TAB_KEY.TERM]: (
            <TermTab
              vocabulary={vocabulary}
              selectedTerm={selectedTerm}
              onSelected={setSelectedTerm}
            />
          ),
        }}
      />
    </IriMigrationDialog>
  );
};

export default VocabularyTermIriMigrationDialog;
