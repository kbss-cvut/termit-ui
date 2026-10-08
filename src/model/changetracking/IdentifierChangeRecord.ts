import { UpdateRecord, UpdateRecordData } from "./UpdateRecord";

/**
 * Represents insertion of an entity into the repository.
 */
export default class IdentifierChangeRecord extends UpdateRecord {
  public readonly changedAttribute = {
    iri: "",
  };
  public constructor(data: UpdateRecordData) {
    super(data);
  }

  get typeLabel(): string {
    return "history.type.identifierChange";
  }
}
