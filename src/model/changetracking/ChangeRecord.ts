import VocabularyUtils from "../../util/VocabularyUtils";
import User, { CONTEXT as USER_CONTEXT, UserData } from "../User";
import Utils from "../../util/Utils";
import { context } from "../MultilingualString";

const ctx = {
  timestamp: {
    "@id": VocabularyUtils.DC_MODIFIED,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  author: VocabularyUtils.PREFIX + "has-editor",
  changedEntity: VocabularyUtils.PREFIX + "has-changed-entity",
  changedAttribute: VocabularyUtils.PREFIX + "has-changed-attribute",
  originalValue: VocabularyUtils.PREFIX + "has-original-value",
  newValue: VocabularyUtils.PREFIX + "has-new-value",
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
