import OntologicalVocabulary from "../util/VocabularyUtils";
import Resource, { ResourceData } from "./Resource";
import Document, { DocumentData } from "./Document";
import VocabularyUtils from "../util/VocabularyUtils";

const ctx = {
  content: VocabularyUtils.CONTENT,
  owner: VocabularyUtils.IS_PART_OF_DOCUMENT,
};

/**
 * This defines only context part specific to File. Complete context can be obtained from Document context.
 *
 * This is for circular dependency prevention.
 */
export const OWN_CONTEXT = ctx;

export interface FileData extends ResourceData {
  origin?: string;
  content?: string;
  owner?: DocumentData;
}

export default class File extends Resource implements FileData {
  public origin: string;
  public content?: string;
  public owner?: DocumentData;

  constructor(data: FileData) {
    super(data);
    this.origin = data.origin ? data.origin : "";
    this.content = data.content;
    this.owner = data.owner;
  }

  public clone() {
    return new File(this);
  }

  public toJsonLd(): {} {
    const jsonLd: any = Object.assign({}, this, {
      // Import lazily to evade circular dependency in context definition between File and Document
      "@context": require("./Document").CONTEXT,
      types: [OntologicalVocabulary.RESOURCE, OntologicalVocabulary.FILE],
    });
    if (jsonLd.owner) {
      const ind = jsonLd.owner.files.findIndex(
        (item: any) => item.iri === this.iri
      );
      // Replace reference to myself with an IRI reference only to prevent serialization cycle errors
      jsonLd.owner.files.splice(ind, 1, { iri: this.iri });
      jsonLd.owner.files = Document.replaceCircularReferencesToOwnerWithOwnerId(
        jsonLd.owner.files
      );
      if (jsonLd.owner.vocabulary) {
        jsonLd.owner.vocabulary = { iri: jsonLd.owner.vocabulary.iri };
      }
    }
    return jsonLd;
  }
}

export const EMPTY_FILE = new File({
  iri: "http://empty",
  label: "",
  terms: [],
});
