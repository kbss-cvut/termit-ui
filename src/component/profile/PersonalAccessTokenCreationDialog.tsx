import * as React from "react";
import { useState } from "react";
import { DateTime } from "luxon";
import { publishMessage } from "../../action/SyncActions";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { createNewPersonalAccessToken } from "../../action/AsyncUserActions";
import { Button, Label } from "reactstrap";
import CustomInput from "../misc/CustomInput";
import SingleActionDialog from "../misc/SingleActionDialog";
import { useI18n } from "../hook/useI18n";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";

interface PersonalAccessTokenCreationDialogProps {
  isOpen: boolean;
  onTokenCreated: (token: string | null) => void;
  onCancel: () => void;
}

function isFuture(date: DateTime) {
  const dateTime = date.startOf("day");
  const now = DateTime.now().startOf("day");
  return dateTime.toUnixInteger() > now.toUnixInteger();
}

const PersonalAccessTokenCreationDialog: React.FC<
  PersonalAccessTokenCreationDialogProps
> = ({ isOpen, onTokenCreated, onCancel }) => {
  const { i18n } = useI18n();
  const [newExpirationValue, setNewExpirationValue] = useState<string>("");
  const dispatch: ThunkDispatch = useDispatch();

  const createNewToken = () => {
    let expiration: DateTime | undefined = undefined;
    if (newExpirationValue.trim().length > 0) {
      expiration = DateTime.fromFormat(newExpirationValue, "yyyy-MM-dd");
      let errorMessage: string | null = null;

      if (!expiration.isValid) {
        errorMessage = i18n("profile.pat.error.invalidDate");
      } else if (!isFuture(expiration)) {
        errorMessage = i18n("profile.pat.error.notFuture");
      }

      if (errorMessage) {
        dispatch(
          publishMessage(
            new Message(
              {
                message: errorMessage,
              },
              MessageType.ERROR
            )
          )
        );
        return;
      }
    }
    dispatch(createNewPersonalAccessToken(expiration)).then(onTokenCreated);
  };

  return (
    <SingleActionDialog
      show={isOpen}
      onClose={onCancel}
      onAction={createNewToken}
      id={"create-pat-dialog"}
      title={i18n("profile.pat.action.create.title")}
      actionColor={"primary"}
      actionButtonText={i18n("create")}
    >
      <Label for={"new-pat-expiration-input"}>
        {i18n("profile.pat.expiration")}
      </Label>
      <CustomInput
        id={"new-pat-expiration-input"}
        type={"date"}
        onChange={(e) => setNewExpirationValue(e.currentTarget.value)}
        value={newExpirationValue}
      />
      <Button
        size={"sm"}
        color="outline-dark"
        onClick={() => setNewExpirationValue("")}
      >
        {i18n("profile.pat.action.noExpiration")}
      </Button>
    </SingleActionDialog>
  );
};

export default PersonalAccessTokenCreationDialog;
