import IriMigrationDialog, {
  IriMigrationDialogControlProps,
} from "../asset/IriMigrationDialog";
import Vocabulary from "../../model/Vocabulary";
import { useState } from "react";
import { useI18n } from "../hook/useI18n";
import CustomInput from "../misc/CustomInput";
import {
  IriMigrationType,
  MigrationParams,
} from "../../model/IriMigrationType";
import ValidationResult from "../../model/form/ValidationResult";

export interface VocabularyIriMigrationDialogProps
  extends IriMigrationDialogControlProps {
  vocabulary: Vocabulary;
}

const VocabularyIriMigrationDialog = ({
  onClose,
  isVisible,
  vocabulary,
}: VocabularyIriMigrationDialogProps) => {
  const { i18n } = useI18n();
  const [newPreferredNamespaceUri, setNewPreferredNamespaceUri] = useState(
    vocabulary.preferredNamespaceUri
  );
  const migrationParams: MigrationParams = { newPreferredNamespaceUri };

  return (
    <IriMigrationDialog
      title={i18n("vocabulary.migrate.iri.title")}
      confirmationInputLabel={i18n("vocabulary.migrate.iri.confirmLabel")}
      isVisible={isVisible}
      onClose={onClose}
      asset={vocabulary}
      migrationType={IriMigrationType.VOCABULARY}
      newIriValidator={() => ValidationResult.VALID}
      requestParams={migrationParams}
      onMigrated={onClose}
    >
      {({ iriInputs }) => (
        <>
          {iriInputs}
          <CustomInput
            name="edit-vocabulary-namespace-uri"
            label={i18n("vocabulary.preferredNamespaceUri")}
            value={newPreferredNamespaceUri}
            onChange={(e) => setNewPreferredNamespaceUri(e.target.value)}
          />
        </>
      )}
    </IriMigrationDialog>
  );
};

export default VocabularyIriMigrationDialog;
