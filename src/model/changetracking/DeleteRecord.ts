import ChangeRecord, { ChangeRecordData } from "./ChangeRecord";
import MultilingualString from "../MultilingualString";

export interface DeleteRecordData extends ChangeRecordData {
  label: MultilingualString;
}

/**
 * Represents insertion of an entity into the repository.
 */
export default class DeleteRecord extends ChangeRecord {
  public readonly label: MultilingualString;
  public readonly vocabulary?: string;
  public constructor(data: DeleteRecordData) {
    super(data);
    this.label = data.label;
  }

  get typeLabel(): string {
    return "history.type.delete";
  }
}
