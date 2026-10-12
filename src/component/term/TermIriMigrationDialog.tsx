import IriMigrationDialog, {
  IriMigrationDialogControlProps,
} from "../asset/IriMigrationDialog";
import Vocabulary from "../../model/Vocabulary";
import Term from "../../model/Term";
import { useI18n } from "../hook/useI18n";
import ValidationResult from "../../model/form/ValidationResult";
import CustomInput from "../misc/CustomInput";
import { IriMigrationType } from "../../model/IriMigrationType";

export interface TermIriMigrationDialogProps
  extends IriMigrationDialogControlProps {
  term: Term;
  vocabulary: Vocabulary;
}

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

const TermIriMigrationDialog = ({
  onClose,
  isVisible,
  vocabulary,
  term,
}: TermIriMigrationDialogProps) => {
  const { formatMessage, i18n } = useI18n();
  const validateNewIri = (newIri: string) => {
    return validateTermIri(vocabulary, newIri, formatMessage);
  };

  return (
    <IriMigrationDialog
      title={i18n("term.migrate.iri.title")}
      confirmationInputLabel={i18n("term.migrate.iri.confirmLabel")}
      isVisible={isVisible}
      onClose={onClose}
      asset={term}
      newIriValidator={validateNewIri}
      migrationType={IriMigrationType.TERM}
      onMigrated={onClose}
    >
      {({ iriInputs }) => (
        <>
          <CustomInput
            name="edit-vocabulary-namespace-uri"
            label={i18n("vocabulary.preferredNamespaceUri")}
            readOnly={true}
            disabled={true}
            value={vocabulary.preferredNamespaceUri}
          />
          {iriInputs}
        </>
      )}
    </IriMigrationDialog>
  );
};

export default TermIriMigrationDialog;
