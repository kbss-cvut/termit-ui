import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import { FormGroup } from "reactstrap";
import CustomInput from "../misc/CustomInput";
import { HasIdentifier, HasLocalizableLabel } from "../../model/Asset";
import ValidationResult from "../../model/form/ValidationResult";

export interface ResetHandle {
  /// Clears the form input values in the migration dialog
  resetForm: () => void;
}

export type AssetForMigration = HasLocalizableLabel & HasIdentifier;

export interface IriMigrationDialogControlProps {
  isVisible: boolean;
  onCancel: () => void;
}

export interface IriMigrationDialogProps
  extends IriMigrationDialogControlProps {
  /// The Asset whose IRI should be migrated
  asset: AssetForMigration | null;
  /// Text for the label of confirmation input requiring user to type in the label of the asset
  confirmationInputLabel: string;
  /// Title of the dialog
  title?: string;
  children?: ReactNode;
}

/**
 * Dialog offering the migration of a resource identifier.
 *
 * @template A the type fot the asset whose identifier should be migrated
 */
const IriMigrationDialog = forwardRef<ResetHandle, IriMigrationDialogProps>(
  (props, ref) => {
    const { i18n, locale } = useI18n();
    const { asset } = props;
    /// The value of the input where user is required to enter the label of the asset
    const [confirmationLabelValue, setConfirmationLabelValue] = useState("");
    const [newIri, setNewIri] = useState("");

    const resetForm = () => {
      setNewIri("");
      setConfirmationLabelValue("");
    };

    useImperativeHandle(ref, () => ({
      resetForm,
    }));

    const isNewIriValid =
      !!newIri && Utils.isUri(newIri) && newIri !== asset?.iri;
    const isLabelConfirmed =
      asset != null && asset.getLabel(locale) === confirmationLabelValue;

    return (
      <ConfirmCancelDialog
        show={props.isVisible}
        onConfirm={() => {}}
        onClose={props.onCancel}
        title={props.title ?? i18n("asset.migrate.iri.label")}
        confirmKey={"asset.migrate.iri.label"}
        id={"asset-migrate-iri-dialog"}
        size={"lg"}
        confirmColor={"red"}
        confirmDisabled={!isNewIriValid || !isLabelConfirmed}
      >
        <h1 className={"text-danger"}>
          {i18n("asset.migrate.iri.dangerZone.label")}
        </h1>
        <label>{i18n("asset.migrate.iri.dangerZone.description")}</label>
        {props.children}
        <FormGroup>
          <CustomInput
            value={asset?.iri ?? ""}
            disabled={true}
            label={i18n("asset.migrate.iri.originalIri")}
          />
          <CustomInput
            value={newIri}
            onInput={(e) => setNewIri(e.currentTarget.value)}
            label={i18n("asset.migrate.iri.newIri")}
            validation={ValidationResult.fromBoolean(isNewIriValid)}
          />
          <CustomInput
            label={props.confirmationInputLabel}
            validation={ValidationResult.fromBoolean(isLabelConfirmed)}
            value={confirmationLabelValue}
            onInput={(e) => setConfirmationLabelValue(e.currentTarget.value)}
          />
        </FormGroup>
      </ConfirmCancelDialog>
    );
  }
);

export default IriMigrationDialog;
