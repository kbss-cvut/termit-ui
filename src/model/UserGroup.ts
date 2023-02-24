import { UserData } from "./User";
import VocabularyUtils from "../util/VocabularyUtils";
import { CONTEXT as USER_CONTEXT } from "./User";
import Utils from "../util/Utils";
import { HasLabel } from "./Asset";

const CTX = {
  iri: "@id",
  types: "@type",
  label: VocabularyUtils.DC_TITLE,
  members: VocabularyUtils.NS_SIOC + "has_member",
};

export const CONTEXT = Object.assign({}, CTX, USER_CONTEXT);

export interface UserGroupData {
  iri?: string;
  label: string;
  members?: UserData[];
}

export default class UserGroup implements UserGroupData, HasLabel {
  public iri?: string;
  public label: string;
  public members: UserData[];

  constructor(data: UserGroupData) {
    this.iri = data.iri;
    this.label = data.label;
    this.members = Utils.sanitizeArray(data.members);
    this.members.sort((a, b) => a.username.localeCompare(b.username));
  }

  getLabel(): string {
    return this.label;
  }

  public toJson(): UserGroupData {
    return Object.assign({}, this, {
      "@context": CONTEXT,
      types: [VocabularyUtils.USER_GROUP],
    });
  }
}
