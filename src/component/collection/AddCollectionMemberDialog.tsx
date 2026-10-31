import {
  CollectionMemberData,
  SkosCollectionDto,
} from "../../model/Collection";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { NewCollectionMemberSelect } from "./NewCollectionMemberSelect";
import { Label } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import {
  addCollectionMember,
  reloadSkosCollection,
} from "../../action/AsyncCollectionActions";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { trackPromise } from "react-promise-tracker";

export interface AddCollectionMemberDialogHandle {
  open: () => void;
}

export interface AddCollectionMemberDialogProps {
  collection: SkosCollectionDto;
}

const ADD_MEMBER_DIALOG_PROMISE_AREA = "ADD_MEMBER_DIALOG_PROMISE_AREA";

export const AddCollectionMemberDialog = forwardRef<
  AddCollectionMemberDialogHandle,
  AddCollectionMemberDialogProps
>(({ collection }, ref) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<CollectionMemberData | null>(null);

  useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

  const onClose = useCallback(() => {
    setValue(null);
    setIsOpen(false);
  }, []);

  const onConfirm = useCallback(() => {
    if (!value) {
      return;
    }
    trackPromise(
      dispatch(addCollectionMember(collection, value.iri)).then((action) => {
        if (action.status === AsyncActionStatus.SUCCESS) {
          return dispatch(reloadSkosCollection(collection)).then(() =>
            onClose()
          );
        }
        return Promise.resolve();
      }),
      ADD_MEMBER_DIALOG_PROMISE_AREA
    );
  }, [collection, dispatch, onClose, value]);

  return (
    <ConfirmCancelDialog
      show={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      id={"add-collection-member-dialog"}
      title={i18n("collection.members.add.title")}
      confirmKey={"collection.members.add"}
      confirmDisabled={value == null}
    >
      <Label>{i18n("collection.members.add.description")}</Label>
      <NewCollectionMemberSelect {...{ collection, value, setValue }} />
      <PromiseTrackingMask
        area={ADD_MEMBER_DIALOG_PROMISE_AREA}
        coverViewport={true}
      />
    </ConfirmCancelDialog>
  );
});
