import {
  Button,
  ButtonToolbar,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { CustomAttribute } from "../../../../model/RdfsResource";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Table from "../../../misc/table/Table";
import If from "../../../misc/If";

export interface CustomAttributesProfileImportDialogProps {
  /**
   * Table columns to render custom attributes
   */
  tableColumns: ColumnDef<CustomAttribute>[];
}

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

  /// Attributes of the loaded profile wrapped as model instances so that the table columns can use their methods
  const profileAttributes = useMemo(
    () =>
      loadedProfile?.customAttributes.map(
        (attribute) => new CustomAttribute(attribute)
      ) ?? [],
    [loadedProfile]
  );

  const tableInstance = useReactTable<CustomAttribute>({
    columns: props.tableColumns,
    data: profileAttributes,
    getRowId: (attribute) => attribute.iri,
    initialState: {
      sorting: [
        {
          id: "label",
          desc: false,
        },
      ],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
        <If expression={!!loadedProfile?.customAttributes}>
          <Label>
            {i18n(
              "administration.customization.customAttributes.profile.import.attributes"
            )}
          </Label>
          <Table instance={tableInstance} />
        </If>
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
