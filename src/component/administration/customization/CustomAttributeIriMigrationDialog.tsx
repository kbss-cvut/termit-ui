import IriMigrationDialog, {
  IriMigrationDialogControlProps,
  ResetHandle,
} from "../../asset/IriMigrationDialog";
import { CustomAttribute } from "../../../model/RdfsResource";
import { useEffect, useRef, useState } from "react";
import { FormGroup, Label } from "reactstrap";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import Utils from "../../../util/Utils";
import ValidationResult from "../../../model/form/ValidationResult";
import { IriMigrationType } from "../../../model/IriMigrationType";
import { AsyncAction, AsyncFailureAction } from "../../../action/ActionType";
import AsyncActionStatus from "../../../action/AsyncActionStatus";

const CustomAttributeIriMigrationDialog = ({
  onClose,
  isVisible,
}: IriMigrationDialogControlProps) => {
  const { i18n, locale } = useI18n();
  const dialogRef = useRef<ResetHandle | null>(null);
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const [selectedIri, setSelectedIri] = useState<string | null>(null);
  // The selector provides only a copy of the attribute data,
  // so the selected attribute is resolved from the loaded attributes
  const selectedAttribute =
    customAttributes.find((attribute) => attribute.iri === selectedIri) ?? null;

  useEffect(() => {
    dialogRef.current?.resetForm();
  }, [selectedIri]);

  const onMigrated = (action: AsyncAction | AsyncFailureAction) => {
    if (action.status === AsyncActionStatus.SUCCESS) {
      setSelectedIri(null);
      onClose();
    }
  };

  return (
    <IriMigrationDialog
      ref={dialogRef}
      title={i18n(
        "administration.customization.customAttributes.migrate.iri.title"
      )}
      confirmationInputLabel={i18n(
        "administration.customization.customAttributes.migrate.iri.confirmLabel"
      )}
      isVisible={isVisible}
      onClose={onClose}
      asset={selectedAttribute}
      newIriValidator={() => ValidationResult.VALID}
      migrationType={IriMigrationType.CUSTOM_ATTRIBUTE}
      onMigrated={onMigrated}
    >
      {({ iriInputs }) => (
        <>
          <FormGroup>
            <Label className="attribute-label">
              {i18n("administration.customization.customAttribute")}
            </Label>
            <IntelligentTreeSelect
              id="custom-attribute-migrate-iri-selector"
              options={customAttributes}
              value={selectedIri}
              onChange={(attribute: CustomAttribute | null) =>
                setSelectedIri(attribute?.iri ?? null)
              }
              valueKey="iri"
              getOptionLabel={(option: CustomAttribute) =>
                getLocalized(option.label, locale)
              }
              valueRenderer={Utils.simpleValueRenderer}
              maxHeight={200}
              multi={false}
              renderAsTree={false}
              placeholder={i18n("select.placeholder")}
              noResultsText={i18n("search.no-results")}
              classNamePrefix="react-select"
            />
          </FormGroup>
          {iriInputs}
        </>
      )}
    </IriMigrationDialog>
  );
};

export default CustomAttributeIriMigrationDialog;
