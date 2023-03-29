import VocabularyUtils from "../util/VocabularyUtils";
import { CONTEXT as USER_CONTEXT, UserData } from "./User";
import { CONTEXT as USERGROUP_CONTEXT, UserGroupData } from "./UserGroup";
import { CONTEXT as USERROLE_CONTEXT, UserRoleData } from "./UserRole";
import { AssetData } from "./Asset";

const ctx = {
  iri: "@id",
  types: "@type",
  records: VocabularyUtils.HAS_ACCESS_CONTROL_RECORD,
  holder: VocabularyUtils.HAS_ACCESS_LEVEL_HOLDER,
  level: {
    "@id": VocabularyUtils.HAS_ACCESS_LEVEL,
    "@type": "@id",
  },
};

export const CONTEXT = Object.assign(
  {},
  ctx,
  USER_CONTEXT,
  USERGROUP_CONTEXT,
  USERROLE_CONTEXT
);

export interface AccessControlList extends AssetData {
  records: AccessControlRecord<any>[];
}

export interface AccessControlRecord<
  T extends UserData | UserGroupData | UserRoleData
> {
  holder: T;
  level: string;
  types: string[];
}
