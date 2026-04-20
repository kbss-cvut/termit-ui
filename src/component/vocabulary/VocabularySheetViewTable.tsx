import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { useSelector } from "react-redux";
import Term, {
  CONTEXT as TERM_CONTEXT,
  TermData,
  TermInfo,
} from "../../model/Term";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import { useI18n } from "../hook/useI18n";
import { getShortLocale } from "../../util/IntlUtil";
import {
  getLocalized,
  getLocalizedPlural,
  MultilingualString,
  PluralMultilingualString,
} from "../../model/MultilingualString";
import Utils from "../../util/Utils";
import Constants from "../../util/Constants";
import Ajax, { params } from "../../util/Ajax";
import BrowserStorage from "../../util/BrowserStorage";
import JsonLdUtils from "../../util/JsonLdUtils";
import { getApiPrefix } from "../../action/ActionUtils";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermStateBadge from "../term/state/TermStateBadge";
import { getTermPath } from "../term/TermLink";
import classNames from "classnames";
import { OWL, SKOS } from "../../util/Namespaces";
import { Link } from "react-router-dom";
import VocabularyNameBadgeButton from "./VocabularyNameBadgeButton";
import "./VocabularySheetViewTable.scss";

interface VocabularySheetViewTableProps {
  vocabulary: Vocabulary;
  selectedTermIri: string | null;
  onTermSelect: (term: Term) => void;
}

interface TermsTablePage {
  pageIndex: number;
  terms: Term[];
  totalCount?: number;
  hasMore: boolean;
}

interface TermsTableColumn {
  id:
    | "label"
    | "type"
    | "exactMatches"
    | "parentTerms"
    | "subTerms"
    | "relatedTerms"
    | "notation"
    | "scopeNote"
    | "example"
    | "status"
    | "definition";
  title: string;
  minWidthRem: number;
  growFr?: number;
  hideable: boolean;
  render: (term: Term) => React.ReactNode;
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

const LOAD_PAGE_SIZE = 100;
const LOAD_MORE_THRESHOLD = 12;
const VIRTUALIZED_ROW_ESTIMATE_SIZE = 46;
const VIRTUALIZED_OVERSCAN_ROWS = 10;

function resolveVocabularyFragment(vocabularyIri?: string): string {
  if (!vocabularyIri) {
    return "";
  }
  try {
    return VocabularyUtils.create(vocabularyIri).fragment;
  } catch {
    return vocabularyIri;
  }
}

function resolveTotalCount(headers: unknown): number | undefined {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }

  const xTotalCountHeader =
    // Axios can expose headers either as plain object keys or via get(name)
    (headers as Record<string, string | string[] | undefined>)[
      Constants.Headers.X_TOTAL_COUNT
    ] ??
    (typeof (headers as { get?: (name: string) => string | undefined }).get ===
    "function"
      ? (headers as { get: (name: string) => string | undefined }).get(
          Constants.Headers.X_TOTAL_COUNT
        )
      : undefined);
  const value = Array.isArray(xTotalCountHeader)
    ? xTotalCountHeader[0]
    : xTotalCountHeader;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function previewValues(values: string[]): React.ReactNode {
  const sanitized = Utils.sanitizeArray(values)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (sanitized.length === 0) {
    return "";
  }

  return (
    <span className="text-truncate d-block w-100">{sanitized.join(", ")}</span>
  );
}

function resolveLocalizedTermLabel(
  item: { iri?: string; label?: MultilingualString },
  locale: string
): string {
  return (item.label ? getLocalized(item.label, locale) : "") || item.iri || "";
}

function previewTermList(
  items: Array<Term | TermInfo> | undefined,
  locale: string,
  baseVocabularyIri?: string
): React.ReactNode {
  const sanitized = Utils.sanitizeArray(items) as Array<Term | TermInfo>;

  if (sanitized.length === 0) {
    return "";
  }

  return (
    <span className="term-table-list-preview text-truncate d-block w-100">
      {sanitized.map((item, index) => {
        const fallbackLabel =
          resolveLocalizedTermLabel(item, locale) ||
          resolveVocabularyFragment(item.iri);
        const vocabulary = item.vocabulary;
        const hasNavigableVocabulary = !!vocabulary?.iri;
        const showBadge =
          vocabulary?.iri &&
          baseVocabularyIri &&
          vocabulary.iri !== baseVocabularyIri;

        return (
          <React.Fragment key={item.iri || `${index}`}>
            {index > 0 && ", "}
            {item.iri && hasNavigableVocabulary ? (
              <span className="d-inline-flex align-items-center flex-nowrap term-badge-wrapper">
                <Link
                  to={getTermPath({
                    iri: item.iri,
                    label:
                      item.label && Object.keys(item.label).length > 0
                        ? item.label
                        : ({ [locale]: fallbackLabel } as MultilingualString),
                    vocabulary,
                    state: item.state,
                    types: item.types,
                  } as TermInfo)}
                  className="term-table-inline-link"
                  title={fallbackLabel}
                >
                  {fallbackLabel}
                </Link>
                {showBadge && (
                  <VocabularyNameBadgeButton
                    vocabulary={vocabulary}
                    termIri={item.iri}
                    className="ml-2 flex-shrink-0"
                  />
                )}
              </span>
            ) : (
              <span>{fallbackLabel}</span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
}

function resolveTypeLabels(types?: string[]): string[] {
  return Utils.sanitizeArray(types)
    .filter(
      (typeIri) =>
        typeIri !== VocabularyUtils.TERM &&
        !typeIri.startsWith(OWL.namespace) &&
        !typeIri.startsWith(SKOS.namespace)
    )
    .map((typeIri) => {
      try {
        return VocabularyUtils.create(typeIri).fragment;
      } catch {
        return typeIri;
      }
    });
}

function resolveGridColumnWidth(column: TermsTableColumn): string {
  return column.growFr
    ? `minmax(${column.minWidthRem}rem, ${column.growFr}fr)`
    : `${column.minWidthRem}rem`;
}

function normalizeLanguageTag(language: string): string {
  const trimmed = (language || "").trim();
  if (!trimmed || trimmed === "@none") {
    return "";
  }
  return getShortLocale(trimmed).toLowerCase();
}

function getLocalizedInLanguage(
  value: MultilingualString | undefined,
  language: string
): string {
  if (!value) {
    return "";
  }

  const normalizedTarget = normalizeLanguageTag(language);
  if (!normalizedTarget) {
    return "";
  }

  for (const [valueLanguage, localizedValue] of Object.entries(value)) {
    if (normalizeLanguageTag(valueLanguage) !== normalizedTarget) {
      continue;
    }
    if ((localizedValue || "").trim().length > 0) {
      return localizedValue;
    }
  }

  return "";
}

function getLocalizedPluralInLanguage(
  value: PluralMultilingualString | undefined,
  language: string
): string[] {
  if (!value) {
    return [];
  }

  const normalizedTarget = normalizeLanguageTag(language);
  if (!normalizedTarget) {
    return [];
  }

  return Object.entries(value)
    .filter(
      ([valueLanguage]) =>
        normalizeLanguageTag(valueLanguage) === normalizedTarget
    )
    .flatMap(([, localizedValues]) => Utils.sanitizeArray(localizedValues))
    .map((localizedValue) => (localizedValue || "").trim())
    .filter((localizedValue) => localizedValue.length > 0);
}

function hasLabelInLanguage(
  label: MultilingualString | undefined,
  language: string
): boolean {
  return getLocalizedInLanguage(label, language).length > 0;
}

function resolveAvailableTermLanguages(
  terms: Term[],
  preferredLanguage: string
): string[] {
  const seen = new Set<string>();

  terms.forEach((term) => {
    Term.getLanguages(term).forEach((language) => {
      const normalized = normalizeLanguageTag(language);
      if (normalized.length > 0) {
        seen.add(normalized);
      }
    });
  });

  const sorted = Array.from(seen).sort((a, b) => a.localeCompare(b));
  const normalizedPreferred = normalizeLanguageTag(preferredLanguage);

  if (normalizedPreferred && seen.has(normalizedPreferred)) {
    return [
      normalizedPreferred,
      ...sorted.filter((language) => language !== normalizedPreferred),
    ];
  }

  return sorted;
}

export const VocabularySheetViewTable: React.FC<
  VocabularySheetViewTableProps
> = ({ vocabulary, selectedTermIri, onTermSelect }) => {
  const { i18n, formatMessage, locale } = useI18n();
  const shortLocale = getShortLocale(locale);
  const apiPrefix = useSelector((state: TermItState) => getApiPrefix(state));

  const [searchInput, setSearchInput] = React.useState("");
  const [searchString, setSearchString] = React.useState("");
  const [tableLanguage, setTableLanguage] = React.useState(shortLocale);
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

  const termsQuery = useInfiniteQuery({
    queryKey: [
      "vocabulary-sheet-view",
      apiPrefix,
      vocabulary.iri,
      searchString,
      shortLocale,
    ],
    queryFn: async ({ pageParam = 0, signal }) => {
      const requestParams: {
        full?: boolean;
        flat: boolean;
        namespace?: string;
        searchString?: string;
        language?: string;
        page: number;
        size: number;
      } = {
        full: true,
        flat: true,
        language: shortLocale,
        page: Number(pageParam),
        size: LOAD_PAGE_SIZE,
      };

      if (searchString.length > 0) {
        requestParams.searchString = searchString;
      }
      if (vocabularyIri.namespace) {
        requestParams.namespace = vocabularyIri.namespace;
      }

      const requestConfig = params(requestParams);
      const endpoint = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms`;

      if (signal) {
        const abortController = new AbortController();
        signal.addEventListener("abort", () => abortController.abort(), {
          once: true,
        });
        requestConfig.signal(abortController);
      }

      const response = await Ajax.getResponse(endpoint, requestConfig);
      const compacted =
        await JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
          response.data,
          TERM_CONTEXT
        );
      const terms = compacted.map((data) => new Term(data));
      let totalCount = resolveTotalCount(response.headers);

      if (totalCount === undefined && Number(pageParam) === 0) {
        const countParams: {
          full?: boolean;
          flat?: boolean;
          namespace?: string;
          searchString?: string;
          language?: string;
        } = {
          full: true,
          flat: true,
          language: shortLocale,
        };

        if (searchString.length > 0) {
          countParams.searchString = searchString;
        }
        if (vocabularyIri.namespace) {
          countParams.namespace = vocabularyIri.namespace;
        }

        try {
          const countResponse = await Ajax.head(endpoint, params(countParams));
          totalCount = resolveTotalCount(countResponse.headers);
        } catch {
          // Ignore fallback count errors and keep unknown total behavior.
        }
      }

      const hasMore =
        totalCount !== undefined
          ? (Number(pageParam) + 1) * LOAD_PAGE_SIZE < totalCount
          : terms.length === LOAD_PAGE_SIZE;

      return {
        pageIndex: Number(pageParam),
        terms,
        totalCount,
        hasMore,
      } as TermsTablePage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.pageIndex + 1 : undefined,
  });

  const loadedTerms = React.useMemo(
    () => termsQuery.data?.pages.flatMap((page) => page.terms) || [],
    [termsQuery.data]
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

  const columns = React.useMemo<TermsTableColumn[]>(
    () => [
      {
        id: "label",
        title: i18n("glossary.table.column.label"),
        minWidthRem: 18,
        growFr: 2,
        hideable: false,
        render: (term) => (
          <div className="d-flex align-items-center">
            <span className="d-inline-flex align-items-center flex-nowrap term-badge-wrapper">
              <button
                type="button"
                className="btn btn-link p-0 text-left term-table-link"
                onClick={() => onTermSelect(term)}
                title={i18n("glossary.table.openTerm")}
              >
                {getLocalizedInLanguage(term.label, displayLanguage)}
              </button>
            </span>
          </div>
        ),
      },
      {
        id: "type",
        title: i18n("term.metadata.types"),
        minWidthRem: 10,
        growFr: 1,
        hideable: true,
        render: (term) => previewValues(resolveTypeLabels(term.types)),
      },
      {
        id: "exactMatches",
        title: i18n("term.metadata.exactMatches"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term) =>
          previewTermList(
            term.exactMatchTerms,
            displayLanguage,
            vocabulary.iri
          ),
      },
      {
        id: "parentTerms",
        title: i18n("term.metadata.parent"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term) => {
          const directParents = Utils.sanitizeArray(term.parentTerms);
          if (directParents.length > 0) {
            return previewTermList(
              directParents,
              displayLanguage,
              vocabulary.iri
            );
          }
          return "";
        },
      },
      {
        id: "subTerms",
        title: i18n("term.metadata.subTerms"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term) =>
          previewTermList(
            Utils.sanitizeArray(term.subTerms),
            displayLanguage,
            vocabulary.iri
          ),
      },
      {
        id: "relatedTerms",
        title: i18n("term.metadata.related.title"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term) =>
          previewTermList(
            Term.consolidateRelatedAndRelatedMatch(term, displayLanguage),
            displayLanguage,
            vocabulary.iri
          ),
      },
      {
        id: "notation",
        title: i18n("term.metadata.notation.label"),
        minWidthRem: 10,
        growFr: 1,
        hideable: true,
        render: (term) => previewValues(Utils.sanitizeArray(term.notations)),
      },
      {
        id: "scopeNote",
        title: i18n("term.metadata.comment"),
        minWidthRem: 18,
        growFr: 2,
        hideable: true,
        render: (term) =>
          getLocalizedInLanguage(term.scopeNote, displayLanguage) || "",
      },
      {
        id: "example",
        title: i18n("term.metadata.example.label"),
        minWidthRem: 14,
        growFr: 2,
        hideable: true,
        render: (term) =>
          previewValues(
            getLocalizedPluralInLanguage(term.examples, displayLanguage)
          ),
      },
      {
        id: "status",
        title: i18n("glossary.table.column.status"),
        minWidthRem: 10,
        hideable: true,
        render: (term) => <TermStateBadge state={term.state} />,
      },
      {
        id: "definition",
        title: i18n("glossary.table.column.definition"),
        minWidthRem: 20,
        growFr: 3,
        hideable: true,
        render: (term) => (
          <span className="term-table-definition">
            {getLocalizedInLanguage(term.definition, displayLanguage) || ""}
          </span>
        ),
      },
    ],
    [displayLanguage, i18n, onTermSelect]
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
          {virtualRows.map((virtualRow) => {
            const isLoadingRow = virtualRow.index >= displayedTerms.length;
            const term = displayedTerms[virtualRow.index];

            return (
              <div
                key={String(virtualRow.key)}
                className={classNames("vocabulary-sheet-view-row", {
                  "vocabulary-sheet-view-row-selected":
                    term && term.iri === selectedTermIri,
                })}
                style={{
                  gridTemplateColumns,
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoadingRow ? (
                  <div className="vocabulary-sheet-view-loading-row">
                    <Spinner size="sm" color="primary" />
                    <span>{i18n("glossary.table.loadingMore")}</span>
                  </div>
                ) : (
                  visibleColumns.map((column) => (
                    <div
                      key={`${virtualRow.index}-${column.id}`}
                      className="vocabulary-sheet-view-cell"
                    >
                      {column.render(term)}
                    </div>
                  ))
                )}
              </div>
            );
          })}
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
    </div>
  );
};

export default VocabularySheetViewTable;
