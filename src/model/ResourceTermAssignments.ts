import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT, AssetData} from "./Asset";
import {TermData} from "./Term";

const ctx = {
    "term": VocabularyUtils.NS_TERMIT + "je-přiřazením-termu",
    "label": VocabularyUtils.RDFS_LABEL,
    "vocabulary": VocabularyUtils.IS_TERM_FROM_VOCABULARY,
    "resource": VocabularyUtils.PREFIX + "má-zdroj",
    "count": VocabularyUtils.NS_TERMIT + "počet"
};

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface ResourceTermAssignments {
    term: TermData;
    label: string;
    vocabulary: AssetData;
    resource: AssetData;
    types: string[];
}

export interface ResourceTermOccurrences extends ResourceTermAssignments {
    count: number;
}