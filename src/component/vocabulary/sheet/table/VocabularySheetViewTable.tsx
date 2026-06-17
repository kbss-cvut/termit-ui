import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Spinner,
  UncontrolledDropdown,
} from "reactstrap";
import { FaTimes } from "react-icons/fa";
import { useDebouncedCallback } from "use-debounce";
import { useSelector, useDispatch } from "react-redux";
import Term, { TermInfo } from "../../../../model/Term";
import Vocabulary from "../../../../model/Vocabulary";
import TermItState from "../../../../model/TermItState";
import { ThunkDispatch } from "../../../../util/Types";
import { loadTypes } from "../../../../action/AsyncActions";
import { useI18n } from "../../../hook/useI18n";
import {
  getShortLocale,
  normalizeLanguageTag,
} from "../../../../util/IntlUtil";
import Utils from "../../../../util/Utils";
import Constants from "../../../../util/Constants";
import BrowserStorage from "../../../../util/BrowserStorage";
import { getApiPrefix } from "../../../../action/ActionUtils";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import TermStateBadge from "../../../term/state/TermStateBadge";
import classNames from "classnames";
import { useVocabularyTerms } from "../../../../query/hook/useVocabularyTerms";
import { useUpdateTerm } from "../../../../query/hook/useUpdateTerm";
import "./VocabularySheetViewTable.scss";
import {
  previewValues,
  resolveTypeLabels,
  resolveGridColumnWidth,
  resolveAvailableTermLanguages,
  TermsTableColumn,
} from "./VocabularySheetViewTableUtils";
import { ExpandableTextCell } from "./cell/ExpandableTextCell";
import { ExpandableTermListCell } from "./cell/ExpandableTermListCell";
import { TermEditSidebar } from "../sidebar/TermEditSidebar";
import ContainerMask from "../../../misc/ContainerMask";
import {
  getLocalizedInLanguage,
  getLocalizedPluralInLanguage,
  hasLabelInLanguage,
} from "../../../../model/MultilingualString";
import TermLink from "../../../term/TermLink";
import { HoverEditWrapper } from "./cell/HoverEditWrapper";

interface VocabularySheetViewTableProps {
  vocabulary: Vocabulary;
  selectedTermIri: string | null;
  onTermSelect: (term: Term) => void;
}

const DEFAULT_COLUMN_VISIBILITY: Record<TermsTableColumn["id"], boolean> = {
  label: true,
  type: false,
  exactMatches: false,
  parentTerms: true,
  subTerms: false,
  relatedTerms: true,
  notation: false,
  scopeNote: false,
  example: false,
  status: false,
  definition: true,
};

const LOAD_MORE_THRESHOLD = 12;
const VIRTUALIZED_ROW_ESTIMATE_SIZE = 46;
const VIRTUALIZED_OVERSCAN_ROWS = 10;

export const VocabularySheetViewTable: React.FC<
  VocabularySheetViewTableProps
> = ({ vocabulary, selectedTermIri, onTermSelect }) => {
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n, formatMessage, locale } = useI18n();
  const shortLocale = getShortLocale(locale);
  const apiPrefix = useSelector((state: TermItState) => getApiPrefix(state));
  const typeOptions = useSelector((state: TermItState) => state.types);

  React.useEffect(() => {
    dispatch(loadTypes());
  }, [dispatch]);

  const [searchInput, setSearchInput] = React.useState("");
  const [searchString, setSearchString] = React.useState("");
  const [tableLanguage, setTableLanguage] = React.useState(shortLocale);
  const [expandedCellKey, setExpandedCellKey] = React.useState<string | null>(
    null
  );

  const [editingTermUri, setEditingTermUri] = React.useState<string | null>(
    null
  );
  const [editingColumnId, setEditingColumnId] = React.useState<
    TermsTableColumn["id"] | null
  >(null);

  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<TermsTableColumn["id"], boolean>
  >(() => {
    const stored = BrowserStorage.get(
      Constants.STORAGE_TERMS_TABLE_COLUMNS_KEY
    );

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<
          Record<TermsTableColumn["id"], boolean>
        >;
        const columnIds = Object.keys(
          DEFAULT_COLUMN_VISIBILITY
        ) as TermsTableColumn["id"][];
        const hasFullShape = columnIds.every(
          (columnId) => typeof parsed[columnId] === "boolean"
        );

        if (!hasFullShape) {
          return { ...DEFAULT_COLUMN_VISIBILITY };
        }

        return {
          ...DEFAULT_COLUMN_VISIBILITY,
          ...parsed,
          label: true,
        };
      } catch (e) {
        // Fallback to default
      }
    }

    return { ...DEFAULT_COLUMN_VISIBILITY };
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchString(value.trim());
  }, Constants.SEARCH_DEBOUNCE_DELAY);

  const vocabularyIri = React.useMemo(
    () => VocabularyUtils.create(vocabulary.iri!),
    [vocabulary.iri]
  );

  const termsQuery = useVocabularyTerms({
    apiPrefix,
    vocabularyIri,
    searchString,
    language: shortLocale,
  });

  const loadedTerms = React.useMemo(
    () => termsQuery.data?.pages.flatMap((page) => page.terms) || [],
    [termsQuery.data]
  );

  const editingTermData = React.useMemo(() => {
    if (!editingTermUri) return null;
    return loadedTerms.find((t) => t.iri === editingTermUri) || null;
  }, [editingTermUri, loadedTerms]);

  const updateTermMutation = useUpdateTerm();

  const handleSaveEditedTerm = React.useCallback(
    async (updatedProperties: Partial<Term>) => {
      const baseTermData = loadedTerms.find((t) => t.iri === editingTermUri);
      if (!baseTermData) return;

      try {
        const termToUpdate = new Term({
          ...baseTermData,
          ...updatedProperties,
        } as any);

        await updateTermMutation.mutateAsync({
          apiPrefix,
          term: termToUpdate,
        });

        setEditingTermUri(null);
        setEditingColumnId(null);
      } catch (e) {
        console.error("Failed to update term", e);
      }
    },
    [editingTermUri, loadedTerms, updateTermMutation, apiPrefix]
  );

  const availableTermLanguages = React.useMemo(
    () => resolveAvailableTermLanguages(loadedTerms, shortLocale),
    [loadedTerms, shortLocale]
  );

  const displayLanguage = React.useMemo(() => {
    const normalizedCurrent = normalizeLanguageTag(tableLanguage);
    if (availableTermLanguages.includes(normalizedCurrent)) {
      return normalizedCurrent;
    }
    if (availableTermLanguages.length > 0) {
      return availableTermLanguages[0];
    }
    return shortLocale;
  }, [availableTermLanguages, shortLocale, tableLanguage]);

  React.useEffect(() => {
    if (tableLanguage !== displayLanguage) {
      setTableLanguage(displayLanguage);
    }
  }, [displayLanguage, tableLanguage]);

  const displayedTerms = React.useMemo(
    () =>
      loadedTerms.filter((term) =>
        hasLabelInLanguage(term.label, displayLanguage)
      ),
    [displayLanguage, loadedTerms]
  );

  const resolvedTotalCount = termsQuery.data?.pages.find(
    (page) => page.totalCount !== undefined
  )?.totalCount;
  const totalCount = resolvedTotalCount ?? loadedTerms.length;

  const getCellKey = React.useCallback(
    (rowIndex: number, columnId: TermsTableColumn["id"]) =>
      `${rowIndex}:${columnId}`,
    []
  );

  const handleEditClick = React.useCallback(
    (termIri: string, columnId: TermsTableColumn["id"]) => {
      setEditingTermUri(termIri);
      setEditingColumnId(columnId);
    },
    []
  );

  const renderExpandableTermListCell = React.useCallback(
    (
      term: Term,
      items: Array<Term | TermInfo> | undefined,
      rowIndex: number,
      columnId: TermsTableColumn["id"],
      isEditable: boolean = true
    ) => {
      const sanitized = Utils.sanitizeArray(items) as Array<Term | TermInfo>;
      const cellKey = getCellKey(rowIndex, columnId);
      const isExpanded = expandedCellKey === cellKey;

      const content = sanitized.length > 0 && (
        <ExpandableTermListCell
          items={sanitized}
          locale={displayLanguage}
          baseVocabularyIri={vocabulary.iri}
          isExpanded={isExpanded}
          onToggle={() =>
            setExpandedCellKey((previous) =>
              previous === cellKey ? null : cellKey
            )
          }
        />
      );

      if (isEditable) {
        return (
          <HoverEditWrapper onEdit={() => handleEditClick(term.iri, columnId)}>
            {content}
          </HoverEditWrapper>
        );
      }
      return (
        <div className="d-flex w-100 align-items-start term-cell-editor-wrapper">
          {content}
        </div>
      );
    },
    [
      displayLanguage,
      expandedCellKey,
      getCellKey,
      vocabulary.iri,
      handleEditClick,
      i18n,
    ]
  );

  const columns = React.useMemo<TermsTableColumn[]>(
    () => [
      {
        id: "label",
        title: i18n("glossary.table.column.label"),
        minWidthRem: 18,
        growFr: 2,
        hideable: false,
        render: (term, rowIndex) => {
          const text = getLocalizedInLanguage(term.label, displayLanguage);
          return (
            <HoverEditWrapper onEdit={() => handleEditClick(term.iri, "label")}>
              <ExpandableTextCell
                isExpanded={expandedCellKey === getCellKey(rowIndex, "label")}
                onToggle={() => {
                  const cellKey = getCellKey(rowIndex, "label");
                  setExpandedCellKey((prev) =>
                    prev === cellKey ? null : cellKey
                  );
                }}
              >
                <TermLink
                  term={term}
                  language={displayLanguage}
                  className="term-table-link"
                  tooltip={text}
                />
              </ExpandableTextCell>
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "definition",
        title: i18n("glossary.table.column.definition"),
        minWidthRem: 20,
        growFr: 3,
        hideable: true,
        render: (term, rowIndex) => {
          const text = getLocalizedInLanguage(term.definition, displayLanguage);
          return (
            <HoverEditWrapper
              onEdit={() => handleEditClick(term.iri, "definition")}
            >
              {text && (
                <ExpandableTextCell
                  text={text}
                  isExpanded={
                    expandedCellKey === getCellKey(rowIndex, "definition")
                  }
                  onToggle={() => {
                    const cellKey = getCellKey(rowIndex, "definition");
                    setExpandedCellKey((prev) =>
                      prev === cellKey ? null : cellKey
                    );
                  }}
                />
              )}
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "type",
        title: i18n("term.metadata.types"),
        minWidthRem: 10,
        growFr: 1,
        hideable: true,
        render: (term, rowIndex) => {
          const text = previewValues(
            resolveTypeLabels(term.types, typeOptions, displayLanguage)
          );
          return (
            <HoverEditWrapper onEdit={() => handleEditClick(term.iri, "type")}>
              {text && (
                <ExpandableTextCell
                  text={text}
                  isExpanded={expandedCellKey === getCellKey(rowIndex, "type")}
                  onToggle={() => {
                    const cellKey = getCellKey(rowIndex, "type");
                    setExpandedCellKey((prev) =>
                      prev === cellKey ? null : cellKey
                    );
                  }}
                />
              )}
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "exactMatches",
        title: i18n("term.metadata.exactMatches"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) =>
          renderExpandableTermListCell(
            term,
            term.exactMatchTerms,
            rowIndex,
            "exactMatches"
          ),
      },
      {
        id: "parentTerms",
        title: i18n("term.metadata.parent"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) => {
          const directParents = Utils.sanitizeArray(term.parentTerms);
          return renderExpandableTermListCell(
            term,
            directParents,
            rowIndex,
            "parentTerms"
          );
        },
      },
      {
        id: "subTerms",
        title: i18n("term.metadata.subTerms"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) =>
          renderExpandableTermListCell(
            term,
            Utils.sanitizeArray(term.subTerms),
            rowIndex,
            "subTerms",
            false
          ),
      },
      {
        id: "relatedTerms",
        title: i18n("term.metadata.related.title"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) =>
          renderExpandableTermListCell(
            term,
            Term.consolidateRelatedAndRelatedMatch(term, displayLanguage),
            rowIndex,
            "relatedTerms"
          ),
      },
      {
        id: "notation",
        title: i18n("term.metadata.notation.label"),
        minWidthRem: 10,
        growFr: 1,
        hideable: true,
        render: (term, rowIndex) => {
          const text = previewValues(Utils.sanitizeArray(term.notations));
          return (
            <HoverEditWrapper
              onEdit={() => handleEditClick(term.iri, "notation")}
            >
              {text && (
                <ExpandableTextCell
                  text={text}
                  isExpanded={
                    expandedCellKey === getCellKey(rowIndex, "notation")
                  }
                  onToggle={() => {
                    const cellKey = getCellKey(rowIndex, "notation");
                    setExpandedCellKey((prev) =>
                      prev === cellKey ? null : cellKey
                    );
                  }}
                />
              )}
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "scopeNote",
        title: i18n("term.metadata.comment"),
        minWidthRem: 18,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) => {
          const text = getLocalizedInLanguage(term.scopeNote, displayLanguage);
          return (
            <HoverEditWrapper
              onEdit={() => handleEditClick(term.iri, "scopeNote")}
            >
              {text && (
                <ExpandableTextCell
                  text={text}
                  isExpanded={
                    expandedCellKey === getCellKey(rowIndex, "scopeNote")
                  }
                  onToggle={() => {
                    const cellKey = getCellKey(rowIndex, "scopeNote");
                    setExpandedCellKey((prev) =>
                      prev === cellKey ? null : cellKey
                    );
                  }}
                />
              )}
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "example",
        title: i18n("term.metadata.example.label"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term, rowIndex) => {
          const text = previewValues(
            getLocalizedPluralInLanguage(term.examples, displayLanguage)
          );
          return (
            <HoverEditWrapper
              onEdit={() => handleEditClick(term.iri, "example")}
            >
              {text && (
                <ExpandableTextCell
                  text={text}
                  isExpanded={
                    expandedCellKey === getCellKey(rowIndex, "example")
                  }
                  onToggle={() => {
                    const cellKey = getCellKey(rowIndex, "example");
                    setExpandedCellKey((prev) =>
                      prev === cellKey ? null : cellKey
                    );
                  }}
                />
              )}
            </HoverEditWrapper>
          );
        },
      },
      {
        id: "status",
        title: i18n("glossary.table.column.status"),
        minWidthRem: 10,
        hideable: true,
        render: (term) => <TermStateBadge state={term.state} />,
      },
    ],
    [
      displayLanguage,
      i18n,
      onTermSelect,
      renderExpandableTermListCell,
      typeOptions,
    ]
  );

  const visibleColumns = React.useMemo(
    () => columns.filter((column) => columnVisibility[column.id]),
    [columns, columnVisibility]
  );

  const gridTemplateColumns = React.useMemo(
    () =>
      visibleColumns.map((column) => resolveGridColumnWidth(column)).join(" "),
    [visibleColumns]
  );

  const editingColumn = React.useMemo(() => {
    return columns.find((c) => c.id === editingColumnId) || null;
  }, [columns, editingColumnId]);

  const minGridWidth = React.useMemo(() => {
    const totalMinWidthRem = visibleColumns.reduce(
      (sum, column) => sum + column.minWidthRem,
      0
    );
    return `${totalMinWidthRem}rem`;
  }, [visibleColumns]);

  const rowVirtualizer = useVirtualizer({
    count: termsQuery.hasNextPage
      ? displayedTerms.length + 1
      : displayedTerms.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => VIRTUALIZED_ROW_ESTIMATE_SIZE,
    overscan: VIRTUALIZED_OVERSCAN_ROWS,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  React.useEffect(() => {
    const lastVirtualRow = virtualRows[virtualRows.length - 1];

    if (!lastVirtualRow) {
      return;
    }

    if (
      lastVirtualRow.index >= displayedTerms.length - LOAD_MORE_THRESHOLD &&
      termsQuery.hasNextPage &&
      !termsQuery.isFetchingNextPage
    ) {
      termsQuery.fetchNextPage();
    }
  }, [
    displayedTerms.length,
    loadedTerms.length,
    termsQuery.fetchNextPage,
    termsQuery.hasNextPage,
    termsQuery.isFetchingNextPage,
    virtualRows,
  ]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, left: 0 });
    }
  }, [searchString, vocabulary.iri, shortLocale]);

  const updateColumnVisibility = (
    columnId: TermsTableColumn["id"],
    value: boolean
  ) => {
    setColumnVisibility((previous) => {
      const newState = {
        ...previous,
        [columnId]: value,
      };
      BrowserStorage.set(
        Constants.STORAGE_TERMS_TABLE_COLUMNS_KEY,
        JSON.stringify(newState)
      );

      return newState;
    });
  };

  return (
    <div className="vocabulary-sheet-view-table">
      <div className="vocabulary-sheet-view-controls">
        {availableTermLanguages.length > 1 && (
          <div
            className="vocabulary-sheet-view-language-switcher"
            role="group"
            aria-label="Table term language switcher"
          >
            {availableTermLanguages.map((language) => (
              <button
                key={language}
                type="button"
                className={classNames(
                  "btn btn-sm vocabulary-sheet-view-language-button",
                  {
                    "btn-primary": displayLanguage === language,
                    "btn-outline-secondary": displayLanguage !== language,
                  }
                )}
                aria-pressed={displayLanguage === language}
                onClick={() => setTableLanguage(language)}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <InputGroup
          size="sm"
          style={{ width: "24rem" }}
          className="input-group-merge"
        >
          <Input
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              debouncedSearch(value);
            }}
            placeholder={i18n("glossary.table.filter.placeholder")}
          />
          {searchInput && (
            <InputGroupAddon
              addonType="append"
              onClick={() => {
                debouncedSearch.cancel();
                setSearchInput("");
                setSearchString("");
              }}
              style={{ cursor: "pointer", zIndex: 5 }}
            >
              <InputGroupText title={i18n("search.reset")}>
                <FaTimes />
              </InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
        <UncontrolledDropdown className="vocabulary-sheet-view-column-dropdown">
          <DropdownToggle size="sm" color="secondary" caret={true}>
            {i18n("glossary.table.columns.button")}
          </DropdownToggle>
          <DropdownMenu right={true}>
            {columns.map((column) => (
              <DropdownItem
                key={column.id}
                toggle={false}
                disabled={!column.hideable}
                onClick={() =>
                  updateColumnVisibility(
                    column.id,
                    !columnVisibility[column.id]
                  )
                }
              >
                <div className="mb-0 d-flex align-items-center vocabulary-sheet-view-column-option">
                  <Input
                    type="checkbox"
                    checked={columnVisibility[column.id]}
                    onChange={() => {}}
                    style={{ pointerEvents: "none" }}
                    className="column-checkbox"
                  />
                  <span>{column.title}</span>
                </div>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>

      <div className="vocabulary-sheet-view-summary">
        <span>
          {formatMessage("glossary.table.total", {
            count: totalCount,
          })}
        </span>
        <span>
          {formatMessage("glossary.table.loaded", {
            count: displayedTerms.length,
          })}
        </span>
        {termsQuery.isFetching && <Spinner size="sm" color="primary" />}
      </div>

      <div
        className="vocabulary-sheet-view-grid-scroll"
        ref={scrollRef}
        style={{ maxHeight: Utils.calculateAssetListHeight() }}
      >
        <div
          className="vocabulary-sheet-view-grid-header"
          style={{ gridTemplateColumns, minWidth: minGridWidth }}
        >
          {visibleColumns.map((column) => (
            <div key={column.id} className="vocabulary-sheet-view-header-cell">
              {column.title}
            </div>
          ))}
        </div>

        <div
          className="vocabulary-sheet-view-grid-inner"
          style={{
            height: Math.max(rowVirtualizer.getTotalSize(), 56),
            minWidth: minGridWidth,
          }}
        >
          {termsQuery.isLoading ? (
            <ContainerMask />
          ) : (
            virtualRows.map((virtualRow) => {
              const isLoadingRow = virtualRow.index >= displayedTerms.length;
              const term = displayedTerms[virtualRow.index];

              return (
                <div
                  key={String(virtualRow.key)}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={classNames("vocabulary-sheet-view-row", {
                    "vocabulary-sheet-view-row-selected":
                      term && term.iri === selectedTermIri,
                  })}
                  style={{
                    gridTemplateColumns,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoadingRow ? (
                    <div className="vocabulary-sheet-view-loading-row">
                      <Spinner size="sm" color="primary" />
                      <span>{i18n("glossary.table.loadingMore")}</span>
                    </div>
                  ) : (
                    visibleColumns.map((column) => {
                      const cellKey = getCellKey(virtualRow.index, column.id);
                      const isExpandedCell = expandedCellKey === cellKey;

                      return (
                        <div
                          key={`${virtualRow.index}-${column.id}`}
                          className={classNames("vocabulary-sheet-view-cell", {
                            "vocabulary-sheet-view-cell-expanded":
                              isExpandedCell,
                          })}
                        >
                          {column.render(term, virtualRow.index)}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })
          )}
          {termsQuery.isError && (
            <div className="vocabulary-sheet-view-error">
              {i18n("glossary.table.loadError")}
            </div>
          )}
          {!termsQuery.isLoading &&
            !termsQuery.isError &&
            !termsQuery.hasNextPage &&
            displayedTerms.length === 0 && (
              <div className="vocabulary-sheet-view-empty">
                {i18n("glossary.table.empty")}
              </div>
            )}
        </div>
      </div>
      <TermEditSidebar
        isOpen={!!editingTermUri}
        term={editingTermData || null}
        column={editingColumn}
        language={displayLanguage}
        onClose={() => {
          setEditingTermUri(null);
          setEditingColumnId(null);
        }}
        onSave={handleSaveEditedTerm}
      />
    </div>
  );
};

export default VocabularySheetViewTable;
