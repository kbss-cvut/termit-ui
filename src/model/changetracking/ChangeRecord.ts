import VocabularyUtils from "../../util/VocabularyUtils";
import User, { CONTEXT as USER_CONTEXT, UserData } from "../User";
import Utils from "../../util/Utils";
import { context } from "../MultilingualString";

const ctx = {
  timestamp: {
    "@id": `${VocabularyUtils.PREFIX}m\u00e1-datum-a-\u010das-modifikace`,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  author: `${VocabularyUtils.PREFIX}m\u00e1-editora`,
  changedEntity: `${VocabularyUtils.PREFIX}m\u00e1-zm\u011bn\u011bnou-entitu`,
  changedAttribute: `${VocabularyUtils.PREFIX}m\u00e1-zm\u011bn\u011bn\u00fd-atribut`,
  originalValue: `${VocabularyUtils.PREFIX}m\u00e1-p\u016fvodn\u00ed-hodnotu`,
  newValue: `${VocabularyUtils.PREFIX}m\u00e1-novou-hodnotu`,
  label: context(VocabularyUtils.RDFS_LABEL),
};

export const CONTEXT = Object.assign({}, ctx, USER_CONTEXT);

export interface ChangeRecordData {
  iri: string;
  timestamp: string;
  author: UserData;
  changedEntity: { iri: string };
  types: string[];
}

/**
 * Allows to track the history of an entity.
 */
export default abstract class ChangeRecord implements ChangeRecordData {
  public readonly iri: string;
  public readonly timestamp: string;
  public readonly author: User;
  public readonly changedEntity: { iri: string };
  public readonly types: string[];

  protected constructor(data: ChangeRecordData) {
    this.iri = data.iri;
    this.timestamp = data.timestamp;
    this.changedEntity = data.changedEntity;
    this.types = Utils.sanitizeArray(data.types);
    this.author = new User(data.author);
  }

  /**
   * I18n identifier of the type of the change.
   */
  public abstract get typeLabel(): string;
}
