import Term, { TermData, TermInfo } from "../../model/Term";
import { getLocalized } from "../../model/MultilingualString";
import { HasI18n } from "../hoc/withI18n";
import { getShortLocale } from "../../util/IntlUtil";
import Utils from "../../util/Utils";

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
    placeholder: "",
  };
}

export type TermTreeSelectProcessingOptions = {
  searchString?: string;
  selectedIris?: string[];
};

/**
 * Prepares the specified terms for the tree select component. This consists of removing terms and subterms which are
 * not in the specified vocabularies and flattening term ancestors if necessary.
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
  addAncestorsOfSelected(Utils.sanitizeArray(options.selectedIris), result);
  return result;
}

function vocabularyMatches(
  term: Term | TermInfo,
  vocabularies: string[] | undefined
) {
  return !vocabularies || vocabularies.indexOf(term.vocabulary!.iri!) !== -1;
}

/**
 * Flattens ancestors of the specified terms by adding the into the result array together with the terms.
 *
 * This is necessary for proper functionality of the tree select.
 * @param terms Terms to flatten
 */
function flattenAncestors(terms: Term[]) {
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
 * Adds the top-level ancestors of the specified selected items into the the result array if they are not the already.
 *
 * This method ensures that in case a selected term was included in the result using the {@code includeTerms} parameter
 * and it is not a top level concept, its top level ancestor is added to the result array (if it is not there already) so that
 * it is correctly processed and displayed by the tree component.
 *
 * This function deals with situations when the selected terms are not in the first page retrieved for the tree component and
 * are included explicitly in the results. If such an included result is not a top-level concept, it may not be displayed by the
 * tree component because it may have ancestors which are not in the first page retrieved for the tree component as well. This function
 * ensures that such a top-level ancestor is added to the result array so that the tree component can see it.
 * @param selectedIris Identifiers of selected terms
 * @param options Options loaded from the server for display by the tree component
 */
function addAncestorsOfSelected(selectedIris: string[], options: Term[]) {
  selectedIris.forEach(iri => {
    const matching = options.find(t => t.iri === iri);
    if (!matching) {
      return;
    }
    traverseToAncestor(matching, options);
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
function traverseToAncestor(child: Term, options: Term[]) {
  if (Utils.sanitizeArray(child.parentTerms).length > 0) {
    child.parentTerms!.forEach(pt => {
      pt.plainSubTerms = [child.iri];
      traverseToAncestor(pt, options);
    });
  } else {
    if (!options.find(t => t.iri === child.iri)) {
      options.push(child);
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
