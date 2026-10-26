import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { CollectionMember, SkosCollectionDto } from "../../model/Collection";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { useI18n } from "../hook/useI18n";
import { Label } from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { removeCollectionMember } from "../../action/AsyncCollectionActions";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";

export interface RemoveCollectionMemberDialogHandle {
  open: (member: CollectionMember) => void;
}

export interface RemoveCollectionMemberDialogProps {
  collection: SkosCollectionDto;
  /**
   * Callback called after a collection member is successfully removed
   */
  onMemberRemoved: (member: CollectionMember) => void;
}

const REMOVE_COLLECTION_MEMBER_PROMISE_AREA =
  "REMOVE_COLLECTION_MEMBER_DIALOG_REMOVE_MEMBER_PROMISE_AREA";

export const RemoveCollectionMemberDialog = forwardRef<
  RemoveCollectionMemberDialogHandle,
  RemoveCollectionMemberDialogProps
>(({ collection, onMemberRemoved }, ref) => {
  const { i18n, formatMessage, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [memberForRemoval, setMemberForRemoval] =
    useState<CollectionMember | null>(null);

  useImperativeHandle(ref, () => ({
    open: setMemberForRemoval,
  }));

  const onClose = useCallback(() => setMemberForRemoval(null), []);

  const onConfirm = useCallback(() => {
    if (memberForRemoval) {
      trackPromise(
        dispatch(removeCollectionMember(collection, memberForRemoval.iri)).then(
          (action) => {
            if (action.status === AsyncActionStatus.SUCCESS) {
              onMemberRemoved(memberForRemoval);
              onClose();
            }
          }
        ),
        REMOVE_COLLECTION_MEMBER_PROMISE_AREA
      );
    }
  }, [collection, dispatch, memberForRemoval, onClose, onMemberRemoved]);

  return (
    <>
      <ConfirmCancelDialog
        show={memberForRemoval != null}
        onClose={onClose}
        onConfirm={onConfirm}
        id={"skos-collection-remove-member-dialog"}
        title={i18n("collection.members.remove.title")}
        confirmKey={"collection.members.remove"}
        confirmColor={"danger"}
        confirmDisabled={memberForRemoval == null}
      >
        <Label>
          {formatMessage("collection.members.remove.description", {
            label: memberForRemoval?.getLabel(locale),
          })}
        </Label>
        <PromiseTrackingMask
          area={REMOVE_COLLECTION_MEMBER_PROMISE_AREA}
          coverViewport={true}
        />
      </ConfirmCancelDialog>
    </>
  );
});
