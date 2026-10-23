import {
  CollectionMemberData,
  SkosCollectionDto,
} from "../../model/Collection";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { forwardRef, useImperativeHandle, useState } from "react";
import { NewCollectionMemberSelect } from "./NewCollectionMemberSelect";
import { Label } from "reactstrap";
import { useI18n } from "../hook/useI18n";

export interface AddCollectionMemberDialogHandle {
  open: () => void;
}

export interface AddCollectionMemberDialogProps {
  collection: SkosCollectionDto;
}

export const AddCollectionMemberDialog = forwardRef<
  AddCollectionMemberDialogHandle,
  AddCollectionMemberDialogProps
>(({ collection }, ref) => {
  const { i18n } = useI18n();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<CollectionMemberData | null>(null);

  useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

  return (
    <ConfirmCancelDialog
      show={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={() => {}}
      id={"add-collection-member-dialog"}
      title={i18n("collection.members.add.title")}
      confirmKey={"collection.members.add"}
      confirmDisabled={value == null}
    >
      <Label>{i18n("collection.members.add.description")}</Label>
      <NewCollectionMemberSelect {...{ collection, value, setValue }} />
    </ConfirmCancelDialog>
  );
});
