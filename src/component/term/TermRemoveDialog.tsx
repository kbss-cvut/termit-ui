import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FormattedMessage } from "react-intl";
import { FormText, Label } from "reactstrap";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { trackPromise } from "react-promise-tracker";
import Term from "../../model/Term";
import {
  SubTermRemovalStrategy,
  TermRemovalOptions,
} from "../../model/TermRemovalOptions";
import {
  Rdf4jIRI,
  Rdf4jResource,
  Rdf4jStatement,
} from "../../model/Rdf4jStatement";
import { getLocalized } from "../../model/MultilingualString";
import { getInitialPageSize } from "../../action/SyncActions";
import { loadReferencesToTerm } from "../../action/AsyncTermActions";
import { getShortLocale } from "../../util/IntlUtil";
import { ThunkDispatch } from "../../util/Types";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import Select from "../misc/Select";
import Table from "../misc/table/Table";
import Rdf4jValueNode, {
  IriType,
} from "../administration/customization/CustomAttributeRdf4jValueNode";
import { useI18n } from "../hook/useI18n";
import "./TermRemoveDialog.scss";

export interface TermRemoveDialogProps {
  /** Whether the dialog is visible. */
  show: boolean;
  /** Term whose removal should be configured and confirmed. */
  term: Term;
  /** Callback invoked with the selected removal options on confirmation. */
  onSubmit: (options: TermRemovalOptions) => void;
  /** Callback invoked when the user closes the dialog without confirming. */
  onCancel: () => void;
}

/**
 * Sub-term removal strategy option
 */
interface StrategyOption {
  value: SubTermRemovalStrategy;
  labelKey: string;
  descriptionKey: string;
}

const TERM_REFERENCES_PROMISE_AREA = "TERM_REFERENCES_PROMISE_AREA";

const INITIAL_PAGINATION = Object.freeze({
  pageSize: getInitialPageSize(),
  pageIndex: 0,
});

const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    value: SubTermRemovalStrategy.RECONNECT,
    labelKey: "term.remove.subTermsStrategy.reconnect",
    descriptionKey: "term.remove.subTermsStrategy.reconnect.description",
  },
  {
    value: SubTermRemovalStrategy.CASCADE,
    labelKey: "term.remove.subTermsStrategy.cascade",
    descriptionKey: "term.remove.subTermsStrategy.cascade.description",
  },
];

const DEFAULT_STRATEGY_OPTION = STRATEGY_OPTIONS[0].value;

/**
 * Defines columns for incoming term references.
 * The referenced term itself is omitted because it is identical for every row.
 */
function defineColumns(
  i18n: (id: string) => string
): ColumnDef<Rdf4jStatement>[] {
  return [
    {
      header: i18n("term.remove.references.source"),
      accessorKey: "subject",
      cell: (info) => (
        <Rdf4jValueNode
          value={info.getValue() as Rdf4jResource}
          type={IriType.TERM}
        />
      ),
    },
    {
      header: i18n("term.remove.references.relationship"),
      accessorKey: "predicate",
      cell: (info) => <Rdf4jValueNode value={info.getValue() as Rdf4jIRI} />,
    },
    {
      header: i18n("type.vocabulary"),
      accessorKey: "context",
      cell: (info) => {
        const context = info.getValue() as Rdf4jResource | null;
        return context ? (
          <Rdf4jValueNode value={context} type={IriType.VOCABULARY} />
        ) : null;
      },
    },
  ];
}

interface SubTermRemovalStrategySelectProps {
  /// Whether the component should be visible
  isVisible: boolean;
  /// The currently selected value
  value: SubTermRemovalStrategy;
  /// Callback to change the currently selected value
  setValue: (value: SubTermRemovalStrategy) => void;
}
/**
 * Selection for the {@link SubTermRemovalStrategy}
 */
const SubTermRemovalStrategySelect: React.FC<
  SubTermRemovalStrategySelectProps
> = ({ isVisible, value, setValue }) => {
  const { i18n } = useI18n();
  const selectedStrategy = STRATEGY_OPTIONS.find(
    (option) => option.value === value
  );

  if (!isVisible && selectedStrategy) {
    return null;
  }

  return (
    <>
      <Select
        id="term-remove-subterms-strategy"
        label={i18n("term.remove.subTermsStrategy")}
        value={value}
        onChange={(event) =>
          setValue(event.currentTarget.value as SubTermRemovalStrategy)
        }
      >
        {STRATEGY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {i18n(option.labelKey)}
          </option>
        ))}
      </Select>
      {selectedStrategy?.descriptionKey && (
        <FormText className="term-remove-strategy-description">
          {i18n(selectedStrategy?.descriptionKey)}
        </FormText>
      )}
    </>
  );
};

/**
 * Dialog for inspecting references to a term and configuring how the term and
 * its dependent data should be removed.
 */
const TermRemoveDialog: React.FC<TermRemoveDialogProps> = ({
  show,
  term,
  onSubmit,
  onCancel,
}) => {
  const { i18n, formatMessage, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [references, setReferences] = useState<Rdf4jStatement[]>([]);
  const [totalReferences, setTotalReferences] = useState(0);
  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);
  const [subTermsStrategy, setSubTermsStrategy] =
    useState<SubTermRemovalStrategy>(DEFAULT_STRATEGY_OPTION);
  const [removeOccurrences, setRemoveOccurrences] = useState(false);
  const [removeRelationships, setRemoveRelationships] = useState(false);

  const label = getLocalized(term.label, getShortLocale(locale));

  useEffect(() => {
    setReferences([]);
    setTotalReferences(0);
    setPagination(INITIAL_PAGINATION);
    setSubTermsStrategy(DEFAULT_STRATEGY_OPTION);
    setRemoveOccurrences(false);
    setRemoveRelationships(false);
  }, [show, term.iri]);

  useEffect(() => {
    if (!show) {
      return;
    }
    let active = true;
    trackPromise(
      dispatch(
        loadReferencesToTerm(term, {
          size: pagination.pageSize,
          page: pagination.pageIndex,
        })
      ),
      TERM_REFERENCES_PROMISE_AREA
    ).then((result) => {
      if (active && !("error" in result)) {
        setReferences(result.data);
        setTotalReferences(result.totalStatements);
      }
    });
    return () => {
      active = false;
    };
  }, [dispatch, show, term, pagination.pageSize, pagination.pageIndex]);

  const columns = useMemo(() => defineColumns(i18n), [i18n]);
  const tableInstance = useReactTable<Rdf4jStatement>({
    columns,
    data: references,
    getCoreRowModel: getCoreRowModel(),
    enableColumnFilters: false,
    enableSorting: false,
    manualPagination: true,
    rowCount: totalReferences,
    state: { pagination },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function" ? updater(pagination) : updater;
      if (
        newState.pageSize !== pagination.pageSize ||
        newState.pageIndex !== pagination.pageIndex
      ) {
        setPagination(newState);
      }
    },
  });

  const onRemoveConfirmed = () => {
    onSubmit({
      subTermsStrategy,
      removeOccurrences,
      removeRelationships,
    });
  };

  return (
    <ConfirmCancelDialog
      show={show}
      onClose={onCancel}
      onConfirm={onRemoveConfirmed}
      id="term-remove-dialog"
      title={formatMessage("asset.remove.dialog.title", {
        type: i18n("type.term").toLowerCase(),
        label,
      })}
      confirmColor="outline-danger"
      confirmKey="remove"
      size="lg"
    >
      <PromiseTrackingMask area={TERM_REFERENCES_PROMISE_AREA} />
      <Label>
        {formatMessage("term.remove.description", {
          label,
        })}
      </Label>

      {totalReferences > 0 ? (
        <>
          <FormattedMessage
            id="term.remove.references.found"
            values={{ count: totalReferences }}
            tagName="p"
          />
          <Table instance={tableInstance} />
        </>
      ) : null}

      <div className="term-remove-dialog-options">
        <SubTermRemovalStrategySelect
          isVisible={!term.subTerms || term.subTerms.length > 0}
          value={subTermsStrategy}
          setValue={setSubTermsStrategy}
        />

        <div className="mb-3">
          <CustomCheckBoxInput
            id="term-remove-occurrences"
            label={i18n("term.remove.occurrences")}
            hint={i18n("term.remove.occurrences.hint")}
            checked={removeOccurrences}
            onChange={(event) =>
              setRemoveOccurrences(event.currentTarget.checked)
            }
          />
        </div>
        <div className="mb-3">
          <CustomCheckBoxInput
            id="term-remove-relationships"
            label={i18n("term.remove.relationships")}
            hint={i18n("term.remove.relationships.hint")}
            checked={removeRelationships}
            onChange={(event) =>
              setRemoveRelationships(event.currentTarget.checked)
            }
          />
        </div>
      </div>
    </ConfirmCancelDialog>
  );
};

export default TermRemoveDialog;
