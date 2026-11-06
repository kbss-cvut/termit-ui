import VocabularyUtils from "../../util/VocabularyUtils";
import { UpdateRecordData } from "./UpdateRecord";
import ChangeRecord, { ChangeRecordData } from "./ChangeRecord";
import { HasIdentifier } from "../Asset";

export interface OrderedCollectionMembersUpdateChangeRecordData
  extends ChangeRecordData {
  changedAttribute: HasIdentifier;
  originalValue?: HasIdentifier[];
  newValue?: HasIdentifier[];
}

/**
 * Represents members update of an ordered collection
 */
export class OrderedCollectionMembersUpdateChangeRecord
  extends ChangeRecord
  implements OrderedCollectionMembersUpdateChangeRecordData
{
  public readonly changedAttribute: HasIdentifier;
  public readonly originalValue: HasIdentifier[];
  public readonly newValue: HasIdentifier[];

  constructor(data: UpdateRecordData) {
    super(data);
    this.changedAttribute = data.changedAttribute;
    this.originalValue = processRdfCollection(data.originalValue);
    this.newValue = processRdfCollection(data.newValue);
  }

  get typeLabel(): string {
    return "history.type.update";
  }

  get isReversible(): boolean {
    return this.types.includes(VocabularyUtils.REVERSIBLE_CHANGE);
  }
}

function processRdfCollection(rdfCollection: object): HasIdentifier[] {
  if (!("@list" in rdfCollection)) {
    throw new Error("Unable to process RdfCollection, no @list is present");
  }
  return rdfCollection["@list"] as HasIdentifier[];
}
