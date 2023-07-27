import Vocabulary from "../../util/VocabularyUtils";
import VocabularyUtils from "../../util/VocabularyUtils";
import { AssetData, HasIdentifier } from "../Asset";
import Utils from "../../util/Utils";

export const CONTEXT = {
  iri: "@id",
  label: VocabularyUtils.RDFS_LABEL,
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  state: VocabularyUtils.TERM_STATE,
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
  vocabulary?: HasIdentifier;
  state?: HasIdentifier;
}

export default class SearchResult implements AssetData {
  public readonly iri: string;
  public readonly label: string;
  public readonly snippetText: string;
  public readonly snippetField: string;
  public readonly score?: number;
  public readonly types: string[];
  public readonly vocabulary?: HasIdentifier;
  public readonly state?: HasIdentifier;

  constructor(data: SearchResultData) {
    this.iri = data.iri;
    this.label = data.label;
    this.snippetField = data.snippetField;
    this.snippetText = data.snippetText;
    this.score = data.score;
    this.vocabulary = data.vocabulary;
    this.state = data.state;
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
