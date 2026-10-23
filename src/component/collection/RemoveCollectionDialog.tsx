import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { SkosCollectionDto } from "../../model/Collection";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { useI18n } from "../hook/useI18n";
import { getLocalized } from "../../model/MultilingualString";
import CustomInput from "../misc/CustomInput";
import ValidationResult from "../../model/form/ValidationResult";
import { FormattedMessage } from "react-intl";
import { Label } from "reactstrap";
import { trackPromise } from "react-promise-tracker";
import Routing from "../../util/Routing";
import Vocabulary from "../../model/Vocabulary";
import { removeSkosCollection } from "../../action/AsyncCollectionActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import AsyncActionStatus from "../../action/AsyncActionStatus";

export interface RemoveCollectionDialogHandle {
  remove: (collection: SkosCollectionDto) => void;
}

const REMOVE_COLLECTION_PROMISE_AREA = "remove-collection-dialog-promise-area";

export const RemoveCollectionDialog = forwardRef<
  RemoveCollectionDialogHandle,
  { vocabulary: Vocabulary }
>((props, ref) => {
  const { i18n, formatMessage, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  /**
   * Collection to remove, when null, the dialog is closed
   */
  const [collection, setCollection] = useState<SkosCollectionDto | null>(null);
  const { vocabulary } = props;

  const [confirmLabel, setConfirmLabel] = useState<string>("");
  const [isConfirmLabelValid, setIsConfirmLabelValid] =
    useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    remove: setCollection,
  }));

  const onClose = () => {
    setCollection(null);
    setConfirmLabel("");
  };

  const onRemoveConfirm = () => {
    if (!collection) {
      return;
    }
    trackPromise(
      dispatch(removeSkosCollection(collection)),
      REMOVE_COLLECTION_PROMISE_AREA
    ).then((action) => {
      if (action.status === AsyncActionStatus.SUCCESS) {
        onClose();
        Routing.transitionToAsset(vocabulary);
      }
    });
  };

  useEffect(() => {
    const expectedLabel = getLocalized(collection?.title, locale);
    setIsConfirmLabelValid(expectedLabel === confirmLabel);
  }, [collection?.title, locale, confirmLabel]);

  const label = getLocalized(collection?.title, locale);

  return (
    <ConfirmCancelDialog
      show={collection != null}
      onClose={onClose}
      onConfirm={onRemoveConfirm}
      id={"skos-collection-removal-dialog"}
      title={formatMessage("asset.remove.dialog.title", {
        type: i18n("collection.title"),
        label,
      })}
      confirmKey={"remove"}
      confirmColor={"danger"}
      confirmDisabled={!isConfirmLabelValid}
    >
      <Label>
        <FormattedMessage
          id={"collection.remove.description"}
          values={{ label }}
        />
      </Label>
      <CustomInput
        label={i18n("collection.remove.confirm")}
        value={confirmLabel}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmLabel(e.currentTarget.value)
        }
        validation={
          isConfirmLabelValid
            ? ValidationResult.VALID
            : ValidationResult.BLOCKER
        }
      />
    </ConfirmCancelDialog>
  );
});
