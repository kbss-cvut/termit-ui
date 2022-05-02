import Vocabulary from "../util/VocabularyUtils";
import VocabularyUtils from "../util/VocabularyUtils";
import { AssetData } from "./Asset";
import Utils from "../util/Utils";

export const CONTEXT = {
  iri: "@id",
  label: VocabularyUtils.RDFS_LABEL,
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  draft: VocabularyUtils.IS_DRAFT,
  snippetText:
    "http://onto.fel.cvut.cz/ontologies/application/termit/fts/snippet-text",
  snippetField:
    "http://onto.fel.cvut.cz/ontologies/application/termit/fts/snippet-field",
  score: "http://onto.fel.cvut.cz/ontologies/application/termit/fts/score",
  types: "@type",
};

export interface SearchResultData extends AssetData {
  iri: string;
  label: string;
  snippetText: string;
  snippetField: string;
  score?: number;
  types: string[];
  vocabulary?: { iri: string };
  draft?: boolean;
}

export default class SearchResult implements AssetData {
  public readonly iri: string;
  public readonly label: string;
  public readonly snippetText: string;
  public readonly snippetField: string;
  public readonly score?: number;
  public readonly types: string[];
  public readonly vocabulary?: { iri: string };
  public readonly draft?: boolean;

  constructor(data: SearchResultData) {
    this.iri = data.iri;
    this.label = data.label;
    this.snippetField = data.snippetField;
    this.snippetText = data.snippetText;
    this.score = data.score;
    this.vocabulary = data.vocabulary;
    this.draft = data.draft;
    this.types = Utils.sanitizeArray(data.types);
  }

  public copy(): SearchResult {
    return new SearchResult(Object.assign({}, this));
  }

  public get typeNameId(): string {
    if (this.hasType(Vocabulary.VOCABULARY)) {
      return "type.vocabulary";
    } else if (this.hasType(Vocabulary.TERM)) {
      return "type.term";
    } else {
      return "";
    }
  }

  public hasType(type: string): boolean {
    return this.types.indexOf(type) !== -1;
  }
}
