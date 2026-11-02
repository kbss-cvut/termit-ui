import { forwardRef, useImperativeHandle, useState } from "react";
import { SkosCollectionDto } from "../../model/Collection";
import IriMigrationDialog from "../asset/IriMigrationDialog";
import { useI18n } from "../hook/useI18n";
import ValidationResult from "../../model/form/ValidationResult";
import { IriMigrationType } from "../../model/IriMigrationType";

export interface CollectionIriMigrationDialogHandle {
  open: (dto: SkosCollectionDto) => void;
}

export const CollectionIriMigrationDialog =
  forwardRef<CollectionIriMigrationDialogHandle>((_props, ref) => {
    const { i18n } = useI18n();
    const [asset, setAsset] = useState<SkosCollectionDto | null>(null);
    const onClose = () => setAsset(null);

    useImperativeHandle(ref, () => ({
      open: setAsset,
    }));

    return (
      <IriMigrationDialog
        asset={asset}
        isVisible={asset != null}
        confirmationInputLabel={i18n("collection.migrate.iri.confirmLabel")}
        newIriValidator={() => ValidationResult.VALID}
        migrationType={IriMigrationType.SKOS_COLLECTION}
        onMigrated={onClose}
        onClose={onClose}
      >
        {({ iriInputs }) => <>{iriInputs}</>}
      </IriMigrationDialog>
    );
  });
