import IriMigrationDialog, {
  IriMigrationDialogControlProps,
  ResetHandle,
} from "../asset/IriMigrationDialog";
import Vocabulary from "../../model/Vocabulary";
import Term, { TermData } from "../../model/Term";
import {
  FunctionComponent,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Tabs from "../misc/Tabs";
import { Label } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { TermSelector } from "../term/TermSelector";
import Utils from "../../util/Utils";
import ValidationResult from "../../model/form/ValidationResult";
import CustomInput from "../misc/CustomInput";
import {
  IriMigrationType,
  MigrationParams,
} from "../../model/IriMigrationType";
import { AsyncAction, AsyncFailureAction } from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadVocabulary } from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";

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

interface TabProps {
  vocabulary: Vocabulary;
  iriInputs: ReactNode;
}

interface VocabularyTabProps extends TabProps {
  migrationParams: MutableRefObject<MigrationParams>;
}

const VocabularyTab: FunctionComponent<VocabularyTabProps> = ({
  vocabulary,
  iriInputs,
  migrationParams,
}) => {
  const { i18n, locale } = useI18n();
  const [preferredNamespaceUri, setPreferredNamespaceUri] = useState(
    vocabulary.preferredNamespaceUri
  );

  useEffect(() => {
    migrationParams.current.newPreferredNamespaceUri = preferredNamespaceUri;
  }, [preferredNamespaceUri]);

  return (
    <>
      <Label>
        {i18n(TAB_KEY.VOCABULARY) + " "}
        {vocabulary.getLabel(locale)}
      </Label>
      {iriInputs}
      <CustomInput
        name="edit-vocabulary-namespace-uri"
        label={i18n("vocabulary.preferredNamespaceUri")}
        value={preferredNamespaceUri}
        onChange={(e) => setPreferredNamespaceUri(e.target.value)}
      />
    </>
  );
};

interface TermTabProps extends TabProps {
  selectedTerm: Term | null;
  onSelected: (term: Term | null) => void;
}

const TermTab: FunctionComponent<TermTabProps> = ({
  vocabulary,
  selectedTerm,
  onSelected,
  iriInputs,
}) => {
  const { i18n } = useI18n();
  const updateSelectedTerm = (terms: readonly TermData[]) => {
    onSelected(terms[0] != null ? new Term(terms[0]) : null);
  };

  return (
    <>
      <TermSelector
        value={Utils.sanitizeArray(selectedTerm)}
        onChange={updateSelectedTerm}
        includeImported={false}
        vocabularyIri={vocabulary.iri}
        disableScopeToggle={true}
        multi={false}
      />
      <CustomInput
        name="edit-vocabulary-namespace-uri"
        label={i18n("vocabulary.preferredNamespaceUri")}
        readOnly={true}
        disabled={true}
        value={vocabulary.preferredNamespaceUri}
      />
      {iriInputs}
    </>
  );
};

function validateTermIri(
  vocabulary: Vocabulary,
  newIri: string,
  formatMessage: (msg: string, args: object) => string
) {
  const namespace = vocabulary.preferredNamespaceUri;
  if (namespace && newIri.startsWith(namespace) && newIri !== namespace) {
    return ValidationResult.VALID;
  }
  return ValidationResult.blocker(
    formatMessage("asset.migrate.iri.error.preferredNamespace", { namespace })
  );
}

const VocabularyTermIriMigrationDialog = ({
  onClose,
  isVisible,
  vocabulary,
}: VocabularyTermIriMigrationDialogProps) => {
  const { formatMessage, i18n } = useI18n();
  const dialogRef = useRef<ResetHandle | null>(null);
  const [activeTab, setActiveTab] = useState<TAB_KEY>(TAB_KEY.VOCABULARY);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const migrationParams = useRef<MigrationParams>({});
  const selectedAsset =
    activeTab === TAB_KEY.VOCABULARY ? vocabulary : selectedTerm;
  const dispatch: ThunkDispatch = useDispatch();

  useEffect(() => {
    dialogRef.current?.resetForm();
  }, [selectedAsset]);

  const onTabChange = (tabKey: string) => {
    if (tabKey === TAB_KEY.VOCABULARY || tabKey === TAB_KEY.TERM) {
      setActiveTab(tabKey);
    }
    if (tabKey != TAB_KEY.VOCABULARY) {
      migrationParams.current.newPreferredNamespaceUri = undefined;
    }
  };

  const validateNewIri = (newIri: string) => {
    if (activeTab === TAB_KEY.TERM) {
      return validateTermIri(vocabulary, newIri, formatMessage);
    }
    return ValidationResult.VALID;
  };

  const getMigrationType = () => {
    if (activeTab === TAB_KEY.VOCABULARY) {
      return IriMigrationType.VOCABULARY;
    }
    return IriMigrationType.TERM;
  };

  const onMigrated = (action: AsyncAction | AsyncFailureAction) => {
    if (action.status !== AsyncActionStatus.SUCCESS) {
      return Promise.resolve();
    }
    return dispatch(
      loadVocabulary(VocabularyUtils.create(vocabulary.iri))
    ).then(onClose);
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
      onClose={onClose}
      asset={selectedAsset}
      newIriValidator={validateNewIri}
      migrationType={getMigrationType()}
      requestParams={migrationParams.current}
      onMigrated={onMigrated}
    >
      {({ iriInputs }) => (
        <>
          <Tabs
            activeTabLabelKey={activeTab}
            changeTab={onTabChange}
            contentClassName={"mt-3"}
            tabs={{
              [TAB_KEY.VOCABULARY]: (
                <VocabularyTab
                  vocabulary={vocabulary}
                  iriInputs={iriInputs}
                  migrationParams={migrationParams}
                />
              ),
              [TAB_KEY.TERM]: (
                <TermTab
                  vocabulary={vocabulary}
                  selectedTerm={selectedTerm}
                  onSelected={setSelectedTerm}
                  iriInputs={iriInputs}
                />
              ),
            }}
          />
        </>
      )}
    </IriMigrationDialog>
  );
};

export default VocabularyTermIriMigrationDialog;
