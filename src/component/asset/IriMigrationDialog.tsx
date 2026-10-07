import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import CustomInput from "../misc/CustomInput";
import { HasIdentifier, HasLocalizableLabel } from "../../model/Asset";
import ValidationResult from "../../model/form/ValidationResult";
import { migrateIdentifier } from "../../action/AsyncActions";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  IriMigrationPair,
  IriMigrationType,
  MigrationParams,
} from "../../model/IriMigrationType";

export interface ResetHandle {
  /// Clears the form input values in the migration dialog
  resetForm: () => void;
}

export type AssetForMigration = HasLocalizableLabel & HasIdentifier;

export interface IriMigrationDialogControlProps {
  isVisible: boolean;
  onCancel: () => void;
}

export interface IriMigrationDialogContents {
  iriInputs: ReactNode;
}

export interface IriMigrationDialogProps
  extends IriMigrationDialogControlProps {
  /// The Asset whose IRI should be migrated
  asset: AssetForMigration | null;
  /// Text for the label of confirmation input requiring user to type in the label of the asset
  confirmationInputLabel: string;
  /// Title of the dialog
  title?: string;
  /**
   * Validator of the entered new IRI value
   * <p>
   * The new IRI is internally already validated for empty value, invalid URI and equality with the original IRI.
   */
  newIriValidator: (newIri: string) => ValidationResult;
  migrationType: IriMigrationType;
  /// Additional parameters for the migration HTTP request
  requestParams?: MigrationParams;
  children: (contents: IriMigrationDialogContents) => ReactNode;
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
    const dispatch: ThunkDispatch = useDispatch();

    const resetForm = () => {
      setNewIri("");
      setConfirmationLabelValue("");
    };

    const onSubmit = () => {
      if (!asset?.iri) {
        return;
      }
      const iris: IriMigrationPair = {
        originalIri: asset.iri,
        newIri,
      };
      // TODO: track promise
      dispatch(
        migrateIdentifier(iris, props.migrationType, props.requestParams)
      )
        .then(() => {
          console.error("success");
        })
        .catch(() => console.error("error"));
    };

    useImperativeHandle(ref, () => ({
      resetForm,
    }));

    const isLabelConfirmed =
      asset != null && asset.getLabel(locale) === confirmationLabelValue;

    let newIriValidationResult = props.newIriValidator(newIri);

    if (!newIri || !Utils.isUri(newIri)) {
      newIriValidationResult = ValidationResult.blocker(
        i18n("asset.migrate.iri.error.invalidIri")
      );
    }
    if (newIri === asset?.iri) {
      newIriValidationResult = ValidationResult.blocker(
        i18n("asset.migrate.iri.error.sameAsOriginal")
      );
    }

    const isNewIriValid = newIriValidationResult === ValidationResult.VALID;

    return (
      <ConfirmCancelDialog
        show={props.isVisible}
        onConfirm={onSubmit}
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
        {props.children({
          iriInputs: (
            <>
              <CustomInput
                value={asset?.iri ?? ""}
                disabled={true}
                label={i18n("asset.migrate.iri.originalIri")}
              />
              <CustomInput
                value={newIri}
                onInput={(e) => setNewIri(e.currentTarget.value)}
                label={i18n("asset.migrate.iri.newIri")}
                validation={newIriValidationResult}
              />
            </>
          ),
        })}
        <CustomInput
          label={props.confirmationInputLabel}
          validation={ValidationResult.fromBoolean(isLabelConfirmed)}
          value={confirmationLabelValue}
          onInput={(e) => setConfirmationLabelValue(e.currentTarget.value)}
        />
      </ConfirmCancelDialog>
    );
  }
);

export default IriMigrationDialog;
