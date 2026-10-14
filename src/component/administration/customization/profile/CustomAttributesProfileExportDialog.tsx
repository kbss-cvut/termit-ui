import { CustomAttribute } from "../../../../model/RdfsResource";
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
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import Table from "../../../misc/table/Table";
import CustomCheckBoxInput from "../../../misc/CustomCheckboxInput";
import "./CustomAttributesProfileDialog.scss";
import CustomInput from "../../../misc/CustomInput";
import TextArea from "../../../misc/TextArea";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { ThunkDispatch } from "../../../../util/Types";
import { exportCustomAttributesProfile } from "../../../../action/AsyncCustomizationActions";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import { langString } from "../../../../model/MultilingualString";
import { getShortLocale } from "../../../../util/IntlUtil";
import { loadIdentifier } from "../../../asset/CreateAssetUtils";
import { useDebouncedCallback } from "use-debounce";
import Constants from "../../../../util/Constants";

export interface CustomAttributesProfileExportDialogProps {
  customAttributes: CustomAttribute[];
  /**
   * Table columns to render custom attributes
   */
  tableColumns: ColumnDef<CustomAttribute>[];
}

export interface CustomAttributesProfileExportDialogHandle {
  show: () => void;
}

const MODAL_ID = "custom-attributes-profile-export-dialog";
const EXPORT_PROMISE_AREA = "custom-attributes-profile-export";

export const CustomAttributesProfileExportDialog = forwardRef<
  CustomAttributesProfileExportDialogHandle,
  CustomAttributesProfileExportDialogProps
>((props, ref) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  /// Selected attributes to include in the export, keyed by attribute IRI.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [name, setName] = useState("");
  const [iri, setIri] = useState("");
  const [description, setDescription] = useState("");
  /// Whether the IRI should be generated from the name (disabled once the user edits the IRI manually)
  const shouldGenerateIri = useRef(true);

  const generateIri = useDebouncedCallback((profileName: string) => {
    loadIdentifier({
      name: profileName,
      assetType: "CUSTOM_ATTRIBUTE_PROFILE",
    }).then((resp) => {
      if (shouldGenerateIri.current) {
        setIri(resp.data);
      }
    });
  }, Constants.INPUT_DEBOUNCE_WAIT_TIME);

  useImperativeHandle(ref, () => ({ show: () => setIsOpen(true) }), []);

  const onClose = () => {
    generateIri.cancel();
    setIsOpen(false);
    setRowSelection({});
    setIri("");
    setName("");
    setDescription("");
    shouldGenerateIri.current = true;
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setName(value);
    if (shouldGenerateIri.current && value.trim().length > 0) {
      generateIri(value.trim());
    } else {
      generateIri.cancel();
    }
  };

  const onIriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setIri(value);
    shouldGenerateIri.current = value.trim().length === 0;
    generateIri.cancel();
  };

  const columns: ColumnDef<CustomAttribute>[] = useMemo(
    () => [
      {
        id: "checkbox",
        enableColumnFilter: false,
        enableSorting: false,
        meta: { className: "align-middle" },
        cell: ({ row }) => (
          <CustomCheckBoxInput
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      ...props.tableColumns,
    ],
    [props.tableColumns]
  );

  const tableInstance = useReactTable<CustomAttribute>({
    columns,
    data: props.customAttributes,
    getRowId: (attribute) => attribute.iri,
    enableRowSelection: true,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
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

  const selectedIris = useMemo(
    () => new Set(Object.keys(rowSelection).filter((iri) => rowSelection[iri])),
    [rowSelection]
  );

  const onExport = () => {
    const language = getShortLocale(locale);
    trackPromise(
      dispatch(
        exportCustomAttributesProfile(
          {
            iri: iri.trim(),
            title: langString(name.trim(), language),
            description:
              description.trim().length > 0
                ? langString(description.trim(), language)
                : undefined,
          },
          Array.from(selectedIris)
        )
      ),
      EXPORT_PROMISE_AREA
    ).then((result) => {
      if (!("error" in result)) {
        onClose();
      }
    });
  };

  return (
    <Modal id={MODAL_ID} isOpen={isOpen} toggle={onClose} size={"lg"}>
      <ModalHeader toggle={onClose}>
        {i18n(
          "administration.customization.customAttributes.profile.export.heading"
        )}
      </ModalHeader>
      <ModalBody>
        <PromiseTrackingMask area={EXPORT_PROMISE_AREA} />
        <Label>
          {i18n(
            "administration.customization.customAttributes.profile.export.description"
          )}
        </Label>
        <Label>
          {i18n(
            "administration.customization.customAttributes.profile.export.description2"
          )}
        </Label>
        <CustomInput
          name="custom-attributes-profile-export-name"
          label={i18n(
            "administration.customization.customAttributes.profile.name"
          )}
          hint={i18n("required")}
          value={name}
          onChange={onNameChange}
        />
        <CustomInput
          name="custom-attributes-profile-export-iri"
          label={i18n("asset.iri")}
          hint={i18n("required")}
          value={iri}
          onChange={onIriChange}
        />
        <TextArea
          name="custom-attributes-profile-export-description"
          label={i18n(
            "administration.customization.customAttributes.profile.description"
          )}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <Table instance={tableInstance} />
      </ModalBody>
      <ModalFooter>
        <ButtonToolbar className="float-right">
          <Button
            color={"primary"}
            size="sm"
            disabled={
              iri.trim().length === 0 ||
              name.trim().length === 0 ||
              selectedIris.size === 0
            }
            onClick={onExport}
          >
            {i18n(
              "administration.customization.customAttributes.profile.export.title"
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
