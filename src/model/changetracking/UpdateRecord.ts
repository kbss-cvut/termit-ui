import ChangeRecord, { ChangeRecordData } from "./ChangeRecord";
import VocabularyUtils from "../../util/VocabularyUtils";

interface ID {
  iri: string;
}

export type UpdateValueType = any | any[];

export interface UpdateRecordData extends ChangeRecordData {
  changedAttribute: ID;
  originalValue?: undefined | UpdateValueType;
  newValue?: undefined | UpdateValueType;
}

/**
 * Represents an atomic update to an entity.
 */
export class UpdateRecord extends ChangeRecord implements UpdateRecordData {
  public readonly changedAttribute: { iri: string };
  public readonly originalValue?: undefined | UpdateValueType;
  public readonly newValue?: undefined | UpdateValueType;

  constructor(data: UpdateRecordData) {
    super(data);
    this.changedAttribute = data.changedAttribute;
    this.originalValue = data.originalValue;
    this.newValue = data.newValue;
  }

  get typeLabel(): string {
    return "history.type.update";
  }

  get isReversible(): boolean {
    return this.types.includes(VocabularyUtils.REVERSIBLE_CHANGE);
  }
}
