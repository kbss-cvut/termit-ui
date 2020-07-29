import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT, AssetData} from "./Asset";

const ctx = {
    "term": VocabularyUtils.NS_TERMIT + "je-přiřazením-termu",
    "label": VocabularyUtils.RDFS_LABEL,
    "resource": VocabularyUtils.PREFIX + "má-zdroj",
    "count": VocabularyUtils.NS_TERMIT + "počet"
};

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface TermAssignments {
    term: AssetData;
    resource: AssetData;
    label: string;
    types: string[];
}

export interface TermOccurrences extends TermAssignments {
    count: number;
}