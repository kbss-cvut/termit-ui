import {
  Button,
  ButtonToolbar,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useI18n } from "../../../hook/useI18n";
import "./CustomAttributesProfileDialog.scss";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import { CustomAttributesProfile } from "../../../../model/CustomAttributesProfile";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import {
  CustomAttributesProfileImportForm,
  CustomAttributesProfileImportFormHandle,
  DOWNLOAD_PROMISE_AREA,
} from "./CustomAttributesProfileImportForm";
import { importCustomAttributesProfile } from "../../../../action/AsyncCustomizationActions";
import { publishMessage } from "../../../../action/SyncActions";
import Message from "../../../../model/Message";

export interface CustomAttributesProfileImportDialogProps {}

export interface CustomAttributesProfileImportDialogHandle {
  show: () => void;
}

const MODAL_ID = "custom-attributes-profile-import-dialog";
const IMPORT_PROMISE_AREA = "custom-attributes-profile-import-area";

export const CustomAttributesProfileImportDialog = forwardRef<
  CustomAttributesProfileImportDialogHandle,
  CustomAttributesProfileImportDialogProps
>((props, ref) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const [loadedProfile, setLoadedProfile] =
    useState<CustomAttributesProfile | null>(null);
  const importFormRef = useRef<CustomAttributesProfileImportFormHandle>(null);

  const isLoadingProfile = usePromiseTracker({
    area: DOWNLOAD_PROMISE_AREA,
  }).promiseInProgress;

  useImperativeHandle(ref, () => ({ show: () => setIsOpen(true) }), []);

  const onClose = () => {
    setIsOpen(false);
    setLoadedProfile(null);
    importFormRef.current?.reset();
  };

  const onImport = () => {
    if (loadedProfile == null) {
      return;
    }
    trackPromise(
      dispatch(importCustomAttributesProfile(loadedProfile)),
      IMPORT_PROMISE_AREA
    ).then((action) => {
      if ("error" in action) {
        dispatch(
          publishMessage(
            new Message({
              ...action.error,
            })
          )
        );
      } else {
        onClose();
      }
    });
  };

  const isSubmitDisabled = isLoadingProfile || loadedProfile === null;

  return (
    <Modal id={MODAL_ID} isOpen={isOpen} toggle={onClose} size={"lg"}>
      <ModalHeader toggle={onClose}>
        {i18n(
          "administration.customization.customAttributes.profile.import.heading"
        )}
      </ModalHeader>
      <ModalBody>
        <CustomAttributesProfileImportForm
          ref={importFormRef}
          profile={loadedProfile}
          setProfile={setLoadedProfile}
        />
        <PromiseTrackingMask area={IMPORT_PROMISE_AREA} />
      </ModalBody>
      <ModalFooter>
        <ButtonToolbar className="float-right">
          <Button
            color={"primary"}
            size="sm"
            onClick={onImport}
            disabled={isSubmitDisabled}
          >
            {i18n(
              "administration.customization.customAttributes.profile.import.title"
            )}
          </Button>
          <Button color={"outline-dark"} size="sm" onClick={onClose}>
            {i18n("cancel")}
          </Button>
        </ButtonToolbar>
      </ModalFooter>
    </Modal>
  );
});
