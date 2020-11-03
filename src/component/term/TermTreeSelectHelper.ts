import Term, {TermInfo} from "../../model/Term";
import {getLocalized} from "../../model/MultilingualString";

/**
 * Common properties for a tree selector containing terms
 * @param i18n
 */
export function commonTermTreeSelectProps(i18n: (messageId: string) => string) {
    return {
        valueKey: "iri",
        labelKey: "simpleLabel",
        childrenKey: "plainSubTerms",
        renderAsTree: true,
        simpleTreeData: true,
        showSettings: false,
        noResultsText: i18n("main.search.no-results"),
        placeholder: i18n("glossary.select.placeholder")
    };
}


export type TermTreeSelectProcessingOptions = {
    searchString?: string;
    labelLang?: string;
}

/**
 * Prepares the specified terms for the tree select component. This consists of removing terms and subterms which are
 * not in the specified vocabularies and flattening term ancestors if necessary.
 * @param terms Terms to process
 * @param vocabularies Vocabularies in which all the terms should be, or null to switch this filtering off
 * @param options Processing options
 */
export function processTermsForTreeSelect(terms: Term[], vocabularies: (string[] | undefined), options: TermTreeSelectProcessingOptions = {}): Term[] {
    let result: Term[] = [];
    for (const t of terms) {
        if (!vocabularyMatches(t, vocabularies)) {
            continue;
        }
        result.push(t);
        if (t.subTerms) {
            if (vocabularies) {
                t.subTerms = t.subTerms.filter(st => vocabularyMatches(st, vocabularies)).map(st => {
                    (st as any).simpleLabel = getLocalized(st.label, options.labelLang);
                    return st;
                });
            }
            t.syncPlainSubTerms();
        }
        if (options.searchString && t.parentTerms) {
            result = result.concat(flattenAncestors(t.parentTerms, options.labelLang).filter(pt => vocabularyMatches(pt, vocabularies)));
        }
        (t as any).simpleLabel = t.getLabel(options.labelLang);
    }
    return result;
}

function vocabularyMatches(term: Term | TermInfo, vocabularies: string[] | undefined) {
    return !vocabularies || vocabularies.indexOf(term.vocabulary!.iri!) !== -1
}

/**
 * Flattens ancestors of the specified terms by adding the into the result array together with the terms.
 *
 * This is necessary for proper functionality of the tree select.
 * @param terms Terms to flatten
 * @param lang Language used to get label
 */
function flattenAncestors(terms: Term[], lang?: string) {
    let result: Term[] = [];
    for (const t of terms) {
        result.push(t);
        (t as any).simpleLabel = t.getLabel(lang);
        if (t.parentTerms) {
            result = result.concat(flattenAncestors(t.parentTerms, lang));
        }
    }
    return result;
}
