import Term, { TermData, TermInfo } from "../../model/Term";
import { getLocalized } from "../../model/MultilingualString";
import { HasI18n } from "../hoc/withI18n";
import { getShortLocale } from "../../util/IntlUtil";

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
};

/**
 * Prepares the specified terms for the tree select component. This consists of removing terms and subterms which are
 * not in the specified vocabularies and flattening term ancestors if necessary.
 * @param terms Terms to process
 * @param vocabularies Vocabularies in which all the terms should be, or null to switch this filtering off
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
    return result;
}

function vocabularyMatches(
    term: Term | TermInfo,
    vocabularies: string[] | undefined
) {
    return (
        !vocabularies ||
        (term.vocabulary && vocabularies.indexOf(term.vocabulary.iri!) !== -1)
    );
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
