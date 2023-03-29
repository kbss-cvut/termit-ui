import VocabularyUtils from "../util/VocabularyUtils";
import { CONTEXT as USER_CONTEXT, UserData } from "./User";
import { CONTEXT as USERGROUP_CONTEXT, UserGroupData } from "./UserGroup";
import { CONTEXT as USERROLE_CONTEXT, UserRoleData } from "./UserRole";
import { AssetData, SupportsJsonLd } from "./Asset";

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

export type AccessHolderType = UserData | UserGroupData | UserRoleData;

export interface AccessControlRecord<AccessHolderType>
  extends SupportsJsonLd<AccessControlRecord<AccessHolderType>> {
  iri?: string;
  holder: AccessHolderType;
  level: string;
  types: string[];
}

abstract class AbstractAccessControlRecord<T>
  implements AccessControlRecord<T>
{
  public iri?: string;
  public holder: T;
  public level: string;
  public types: string[];

  protected constructor(data: AccessControlRecord<any>) {
    this.holder = data.holder;
    this.level = data.level;
    this.types = [];
  }

  public toJsonLd(): AccessControlRecord<T> {
    return Object.assign({}, this, { "@context": CONTEXT });
  }
}

export class UserAccessControlRecord extends AbstractAccessControlRecord<UserData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [
      VocabularyUtils.NS_TERMIT +
        "z\u00e1znam-\u0159\u00edzen\u00ed-p\u0159\u00edstupu-u\u017eivatele",
    ];
  }
}

export class UserGroupAccessControlRecord extends AbstractAccessControlRecord<UserGroupData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [
      VocabularyUtils.NS_TERMIT +
        "z\u00e1znam-\u0159\u00edzen\u00ed-p\u0159\u00edstupu-u\u017eivatelsk\u00e9-skupiny",
    ];
  }
}

export class UserRoleAccessControlRecord extends AbstractAccessControlRecord<UserRoleData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [
      VocabularyUtils.NS_TERMIT +
        "z\u00e1znam-\u0159\u00edzen\u00ed-p\u0159\u00edstupu-u\u017eivatelsk\u00e9-role",
    ];
  }
}
