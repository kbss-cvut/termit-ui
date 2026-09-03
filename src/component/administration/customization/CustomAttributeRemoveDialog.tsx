import React, { useEffect, useMemo, useState } from "react";
import { CustomAttribute } from "../../../model/RdfsResource";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { useI18n } from "../../hook/useI18n";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import {
  loadCustomAttributeUsage,
  removeCustomAttribute,
} from "../../../action/AsyncCustomizationActions";
import { trackPromise } from "react-promise-tracker";
import {
  RdfIRI,
  RdfResource,
  RdfStatement,
  RdfValue,
} from "../../../model/RdfStatement";
import Table from "../../misc/table/Table";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import CustomAttributeRdfValueNode, {
  getIriType,
  IriType,
} from "./CustomAttributeRdfValueNode";
import { getShortLocale } from "../../../util/IntlUtil";
import { FormattedMessage } from "react-intl";
import {
  DOMAIN_OPTIONS,
  getSelectorOptionLabel,
  RANGE_OPTIONS,
} from "./CustomAttributeSelector";
import CustomInput from "../../misc/CustomInput";
import ValidationResult from "../../../model/form/ValidationResult";
import { getLocalized } from "../../../model/MultilingualString";
import CustomCheckBoxInput from "../../misc/CustomCheckboxInput";
import "./CustomAttributeRemoveDialog.scss";
import { getInitialPageSize } from "../../../util/UISettingsUtil";
import { publishMessage } from "../../../action/SyncActions";
import Message from "../../../model/Message";
import MessageType from "../../../model/MessageType";

export interface CustomAttributeRemoveDialogProps {
  /**
   * The attribute that should be removed.
   *
   * <code>null</code> when dialog should not be visible.
   */
  customAttribute: CustomAttribute | null;
  /**
   * Callback executed <b>after</b> the attribute was removed.
   */
  onDelete: (property: CustomAttribute | null) => void;
  /**
   * Callback executed when user cancels the action
   */
  onCancel: () => void;
}

/**
 * Promise area used when custom attribute usages are being loaded
 */
const CUSTOM_ATTRIBUTE_USAGE_PROMISE_AREA =
  "CUSTOM_ATTRIBUTE_USAGE_PROMISE_AREA";

/**
 * Resolves label of the {@link #typeIri} in {@link RANGE_OPTIONS} and {@link DOMAIN_OPTIONS}.
 * If label is not found returns {@link #fallback}
 *
 * @param typeIri the IRI of the type to resolve
 * @param i18n translation function
 * @param fallback default value to use if no label is found
 */
function getColumnLabel(
  typeIri: string | undefined,
  i18n: (key: string) => string,
  fallback: string
): string {
  if (typeIri == null) {
    return fallback;
  }

  const option = [RANGE_OPTIONS, DOMAIN_OPTIONS]
    .flatMap((a) => a)
    .find((option) => option.value === typeIri);

  if (option) {
    return getSelectorOptionLabel(option, i18n) ?? fallback;
  }

  return fallback;
}

function defineColumns(
  i18n: (id: string) => string,
  customAttribute: CustomAttribute | null
): ColumnDef<RdfStatement>[] {
  const subjectType = getIriType(customAttribute?.domainIri);
  const objectType = getIriType(customAttribute?.rangeIri);
  return [
    {
      header: getColumnLabel(customAttribute?.domainIri, i18n, "subject"),
      accessorKey: "subject",
      cell: (info) => (
        <CustomAttributeRdfValueNode
          value={info.getValue() as RdfResource}
          type={subjectType}
        />
      ),
    },
    {
      header: getColumnLabel(customAttribute?.rangeIri, i18n, "object"),
      accessorKey: "object",
      cell: (info) => (
        <CustomAttributeRdfValueNode
          value={info.getValue() as RdfValue}
          type={objectType}
        />
      ),
    },
    {
      header: i18n("type.vocabulary"),
      accessorKey: "context",
      cell: (info) => (
        <CustomAttributeRdfValueNode
          value={info.getValue() as RdfIRI}
          type={IriType.VOCABULARY}
        />
      ),
    },
  ];
}

const INITIAL_PAGINATION = Object.freeze({
  pageSize: getInitialPageSize(),
  pageIndex: 0,
});

/**
 * Dialog for confirmation of {@link CustomAttribute} removal.
 * <p>
 * Pass non-null {@link props#customAttribute} to make the dialog visible.
 * <p>
 * Once confirmed, the dialog calls API to remove the attribute.
 */
const CustomAttributeRemoveDialog: React.FC<
  CustomAttributeRemoveDialogProps
> = (props) => {
  const { customAttribute, onDelete, onCancel } = props;
  const { i18n, formatMessage, locale } = useI18n();
  const lang = getShortLocale(locale);
  const dispatch: ThunkDispatch = useDispatch();
  const [usageStatements, setUsageStatements] = useState<RdfStatement[]>([]);
  const [totalStatements, setTotalStatements] = useState<number>(0);
  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);
  const [doRemoveUsages, setDoRemoveUsages] = useState(true);
  const [confirmationAttributeName, setConfirmationAttributeName] =
    useState("");

  const attributeIri = useMemo(
    () =>
      customAttribute ? VocabularyUtils.create(customAttribute.iri) : null,
    [customAttribute]
  );

  const label =
    getLocalized(customAttribute?.label, lang) ?? attributeIri?.fragment;

  // Whether user successfully confirmed the intent to remove the custom attribute
  // if there were some usages, confirmation is not required if the attribute is not used
  const removalConfirmed =
    usageStatements.length === 0 ||
    confirmationAttributeName === label ||
    !doRemoveUsages;
  const isConfirmDisabled = !removalConfirmed;
  const isVisible = customAttribute != null && attributeIri != null;

  const onRemoveConfirmed = () => {
    if (customAttribute == null || attributeIri == null || isConfirmDisabled) {
      return;
    }

    dispatch(
      removeCustomAttribute(
        attributeIri,
        doRemoveUsages && usageStatements.length > 0
      )
    ).then(() => onDelete(customAttribute));
  };

  // When attribute changes, reset force removal confirmation and pagination
  useEffect(() => {
    setDoRemoveUsages(true);
    setConfirmationAttributeName("");
    setPagination(INITIAL_PAGINATION);
  }, [customAttribute, attributeIri]);

  useEffect(() => {
    if (attributeIri == null) {
      return;
    }

    trackPromise(
      dispatch(
        loadCustomAttributeUsage(attributeIri, {
          size: pagination.pageSize,
          page: pagination.pageIndex,
        })
      ),
      CUSTOM_ATTRIBUTE_USAGE_PROMISE_AREA
    ).then((result) => {
      if (!("error" in result)) {
        setUsageStatements(result.data);
        setTotalStatements(result.totalStatements);
      } else {
        dispatch(publishMessage(new Message(result.error, MessageType.ERROR)));
        onCancel();
      }
    });
  }, [dispatch, attributeIri, pagination.pageSize, pagination.pageIndex]);

  const columns = useMemo(
    () => defineColumns(i18n, customAttribute),
    [i18n, customAttribute]
  );

  const tableInstance = useReactTable<RdfStatement>({
    columns,
    data: usageStatements,
    getCoreRowModel: getCoreRowModel(),
    enableColumnFilters: false,
    enableSorting: false,
    manualPagination: true,
    rowCount: totalStatements,
    state: { pagination },
    onPaginationChange: (updater) => {
      let newState: PaginationState;
      if (typeof updater === "function") {
        newState = updater(pagination);
      } else {
        newState = updater;
      }

      if (
        newState.pageSize !== pagination.pageSize ||
        newState.pageIndex !== pagination.pageIndex
      ) {
        setPagination(newState);
      }
    },
  });

  return (
    <ConfirmCancelDialog
      show={isVisible}
      onClose={onCancel}
      onConfirm={onRemoveConfirmed}
      id={"custom-attribute-remove-dialog"}
      title={formatMessage("asset.remove.dialog.title", {
        type: i18n("administration.customization.customAttribute"),
        label,
      })}
      confirmColor={"outline-danger"}
      confirmKey={"remove"}
      confirmDisabled={isConfirmDisabled}
      size="lg"
    >
      <PromiseTrackingMask area={CUSTOM_ATTRIBUTE_USAGE_PROMISE_AREA} />
      <FormattedMessage
        id={"administration.customization.customAttributes.removal.description"}
        values={{ label }}
        tagName={"label"}
      />
      {usageStatements.length > 0 && (
        <>
          <Table instance={tableInstance} />
          <CustomCheckBoxInput
            id={"remove-usages-checkbox"}
            label={i18n(
              "administration.customization.customAttributes.removal.removeUsages"
            )}
            checked={doRemoveUsages}
            onChange={(change) => setDoRemoveUsages(change.target.checked)}
          />
          <CustomInput
            label={i18n(
              "administration.customization.customAttributes.removal.confirm"
            )}
            value={confirmationAttributeName}
            disabled={!doRemoveUsages}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmationAttributeName(e.currentTarget.value)
            }
            validation={
              isConfirmDisabled
                ? ValidationResult.BLOCKER
                : ValidationResult.VALID
            }
          />
        </>
      )}
    </ConfirmCancelDialog>
  );
};

export default CustomAttributeRemoveDialog;
