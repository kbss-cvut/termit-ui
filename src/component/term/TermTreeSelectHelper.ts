import Term, { TermData, TermInfo } from "../../model/Term";
import { getLocalized } from "../../model/MultilingualString";
import { HasI18n } from "../hoc/withI18n";
import { getShortLocale } from "../../util/IntlUtil";
import Utils from "../../util/Utils";
import { TermFetchParams, TreeSelectOption } from "../../util/Types";
import VocabularyUtils from "../../util/VocabularyUtils";

/**
 * Common properties for a tree selector containing terms
 * @param intl I18n data
 */
export function commonTermTreeSelectProps(intl: HasI18n) {
  return {
    valueKey: "iri",
    getOptionLabel: (option: Term | TermData) =>
      getLocalized(option.label, getShortLocale(intl.locale)),
    childrenKey: "plainSubTerms",
    renderAsTree: true,
    simpleTreeData: true,
    showSettings: false,
    noResultsText: intl.i18n("main.search.no-results"),
    loadingText: intl.i18n("select.loading"),
    placeholder: "",
    searchDelay: 300,
    classNamePrefix: "react-select",
  };
}

export type TermTreeSelectProcessingOptions = {
  searchString?: string;
  selectedIris?: string[];
  loadingSubTerms?: boolean;
};

/**
 * Prepares the specified terms for the tree select component.
 *
 * This consists of removing terms and subterms which are not in the specified vocabularies and flattening term ancestors if necessary.
 * Also, if selected terms are passed in options, it is ensured that their top-level ancestors are added to the result array to ensure the tree component is
 * able to display them properly.
 * @param terms Terms to process
 * @param vocabularies Vocabularies in which all the terms should be, or undefined to switch this filtering off
 * @param options Processing options
 */
export function processTermsForTreeSelect(
  terms: Term[],
  vocabularies: string[] | undefined,
  options: TermTreeSelectProcessingOptions = {}
): Term[] {
  let result: Term[] = [];
  for (const t of terms) {
    if (!vocabularyMatches(t, vocabularies)) {
      continue;
    }
    result.push(t);
    if (t.subTerms) {
      if (vocabularies) {
        t.subTerms = t.subTerms
          .filter((st) => vocabularyMatches(st, vocabularies))
          .map((st) => {
            return st;
          });
      }
      t.syncPlainSubTerms();
    }
    if (options.searchString && t.parentTerms) {
      result = result.concat(
        flattenAncestors(t.parentTerms).filter((pt) =>
          vocabularyMatches(pt, vocabularies)
        )
      );
    }
  }
  if (!options.loadingSubTerms) {
    addAncestorsOfSelected(Utils.sanitizeArray(options.selectedIris), result);
  }
  return result;
}

function vocabularyMatches(
  term: Term | TermInfo,
  vocabularies: string[] | undefined
) {
  return !vocabularies || vocabularies.indexOf(term.vocabulary!.iri!) !== -1;
}

/**
 * Flattens ancestors of the specified terms by adding them into the result array together with the terms.
 *
 * This is necessary for proper functionality of the tree select.
 * @param terms Terms to flatten
 */
function flattenAncestors(terms: Term[]): Term[] {
  let result: Term[] = [];
  for (const t of terms) {
    result.push(t);
    if (t.parentTerms) {
      result = result.concat(flattenAncestors(t.parentTerms));
    }
  }
  return result;
}

/**
 * Adds the top-level ancestors of the specified selected items into the result array if they are not there already.
 *
 * This method ensures that in case a selected term was included in the result using the {@code includeTerms} parameter
 * and it is not a top level concept, its top level ancestor is added to the result array (if it is not there already) so that
 * it is correctly processed and displayed by the tree component.
 *
 * This function deals with situations when the selected terms are not in the first page retrieved for the tree component and
 * are included explicitly in the results. If such an included result is not a top-level concept, it may not be displayed by the
 * tree component because it may have ancestors which are not in the first page retrieved for the tree component as well. This function
 * ensures that such a top-level ancestor is added to the result array so that the tree component can see it.
 *
 * Note that the  traversal is done in reverse, because it may happen that the root ancestor we are looking for occurs in the
 * options twice - once loaded by default by the query and the second time loaded as part of the includedTerms' ancestors. In this case,
 * the first occurrence does not contain and subterms, which causes the selected term not to be displayed in the selector.
 * @param selectedIris Identifiers of selected terms
 * @param options Options loaded from the server for display by the tree component
 */
function addAncestorsOfSelected(selectedIris: string[], options: Term[]): void {
  selectedIris.forEach((iri) => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (options[i].iri === iri) {
        traverseToAncestor(options[i], options);
        return;
      }
    }
  });
}

/**
 * Recursively traverses to the top-level ancestor of the specified child.
 *
 * Along the way, parent-child relationships required by the tree component are reconstructed. When the top-level
 * ancestor is reached, it is added to the result array (if it is not there already).
 * @param child Child from which to traverse upwards
 * @param options Options loaded from the server for display by the tree component
 */
function traverseToAncestor(
  child: Term & TreeSelectOption,
  options: Term[]
): void {
  if (Utils.sanitizeArray(child.parentTerms).length > 0) {
    child.parentTerms!.forEach((pt) => traverseToAncestor(pt, options));
  } else {
    if (!options.find((t) => t.iri === child.iri)) {
      // Expand the ancestor of a selected item by default
      child.expanded = true;
      options.unshift(child);
    }
  }
}

/**
 * Resolves identifiers of the specified selected terms.
 * @param selected Array of selected Term-based values (optional)
 */
export function resolveSelectedIris(
  selected?: TermInfo[] | TermData[]
): string[] {
  return Utils.sanitizeArray(selected as TermInfo[])
    .filter((t) => t.vocabulary !== undefined)
    .map((t) => t.iri);
}

/**
 * Resolves identifiers of ancestors of the specified term.
 * @param term Term to get ancestor identifiers of
 */
export function resolveAncestors(term: Term): string[] {
  const parentsArr = Utils.sanitizeArray(term.parentTerms);
  if (parentsArr.length === 0) {
    return [];
  }
  const ancestors = parentsArr.map((pt) => pt.iri);
  return parentsArr.flatMap((t) => resolveAncestors(t)).concat(ancestors);
}

export type TermFetchingPostProcessingOptions = {
  matchingVocabularies?: string[];
  selectedTerms?: TermInfo[] | TermData[];
};

export function loadAndPrepareTerms(
  fetchOptions: TermFetchParams<Term | TermData>,
  loadTerms: (
    fetchOptions: TermFetchParams<Term | TermData>
  ) => Promise<Term[]>,
  postOptions: TermFetchingPostProcessingOptions
) {
  const selectedIris = resolveSelectedIris(postOptions.selectedTerms);
  // If the offset is > 0 or we are fetching subterms, the selected terms should have been already included
  const toInclude =
    !fetchOptions.offset && !fetchOptions.optionID ? selectedIris : [];
  return loadTerms({
    ...fetchOptions,
    includeTerms: toInclude,
  })
    .then((terms) => {
      if (toInclude.length === 0) {
        return terms;
      }
      let parentsToExpand = terms
        .filter((t) => toInclude.indexOf(t.iri) !== -1)
        .flatMap((t) => resolveAncestors(t));
      parentsToExpand = [...new Set(parentsToExpand)];
      return Promise.all(parentsToExpand.map((p) => loadTerms({ optionID: p })))
        .then((result) =>
          result.flat(1).map((t: Term & TreeSelectOption) => {
            if (toInclude.indexOf(t.iri) === -1) {
              t.expanded = true;
            }
            return t;
          })
        )
        .then((loaded) => loaded.concat(terms));
    })
    .then((terms) =>
      processTermsForTreeSelect(terms, postOptions.matchingVocabularies, {
        searchString: fetchOptions.searchString,
        selectedIris,
        loadingSubTerms: !!fetchOptions.optionID,
      })
    );
}

/**
 * Resolves namespace for the loadAllTerms action.
 *
 * This means that if the specified options contain an option id, its identifier namespace is returned, because it is a parent
 * whose subterms will be loaded. Otherwise, undefined is returned, so that all terms can be loaded.
 * @param options Term fetching options
 */
export function resolveNamespaceForLoadAll(options: TermFetchParams<any>) {
  return options.optionID
    ? VocabularyUtils.create(options.optionID).namespace
    : undefined;
}
