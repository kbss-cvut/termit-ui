import ChangeRecord, { ChangeRecordData } from "./ChangeRecord";
import { HasIdentifier } from "../Asset";

export interface IdentifierChangeRecordData extends ChangeRecordData {
  originalIdentifier: HasIdentifier;
  newIdentifier: HasIdentifier;
}

/**
 * Represents insertion of an entity into the repository.
 */
export default class IdentifierChangeRecord extends ChangeRecord {
  public readonly originalIdentifier: HasIdentifier;
  public readonly newIdentifier: HasIdentifier;

  public constructor(data: IdentifierChangeRecordData) {
    super(data);
    this.originalIdentifier = data.originalIdentifier;
    this.newIdentifier = data.newIdentifier;
  }

  get typeLabel(): string {
    return "history.type.identifierChange";
  }
}
