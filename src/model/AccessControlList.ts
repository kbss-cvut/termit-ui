import VocabularyUtils from "../util/VocabularyUtils";
import { CONTEXT as USER_CONTEXT, UserData } from "./User";
import { CONTEXT as USERGROUP_CONTEXT, UserGroupData } from "./UserGroup";
import { CONTEXT as USERROLE_CONTEXT, UserRoleData } from "./UserRole";
import { AssetData, SupportsJsonLd } from "./Asset";
import { context, MultilingualString } from "./MultilingualString";

export const CONTEXT = {
  iri: "@id",
  types: "@type",
  records: VocabularyUtils.HAS_ACCESS_CONTROL_RECORD,
  accessLevel: {
    "@id": VocabularyUtils.HAS_ACCESS_LEVEL,
    "@type": "@id",
  },
  label: context(VocabularyUtils.RDFS_LABEL),
  holder: VocabularyUtils.HAS_ACCESS_LEVEL_HOLDER,
};

const RECORD_CONTEXT = {
  iri: "@id",
  types: "@type",
  holder: VocabularyUtils.HAS_ACCESS_LEVEL_HOLDER,
  accessLevel: {
    "@id": VocabularyUtils.HAS_ACCESS_LEVEL,
    "@type": "@id",
  },
};

export interface AccessControlList extends AssetData {
  records: AccessControlRecordData[];
}

export interface AccessControlRecordData extends AssetData {
  iri: string;
  holder: {
    iri: string;
    label: MultilingualString;
    types: string[];
  };
  accessLevel: string;
  types: string[];
}

export type AccessHolderType = UserData | UserGroupData | UserRoleData;

export interface AccessControlRecord<AccessHolderType>
  extends SupportsJsonLd<AccessControlRecord<AccessHolderType>> {
  iri?: string;
  holder: AccessHolderType;
  accessLevel: string;
  types: string[];
}

abstract class AbstractAccessControlRecord<T>
  implements AccessControlRecord<T>
{
  public iri?: string;
  public holder: T;
  public accessLevel: string;
  public types: string[];

  protected constructor(data: AccessControlRecord<any>) {
    this.holder = data.holder;
    this.accessLevel = data.accessLevel;
    this.types = [];
  }

  public abstract toJsonLd(): AccessControlRecord<T>;
}

export class UserAccessControlRecord extends AbstractAccessControlRecord<UserData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [VocabularyUtils.USER_ACCESS_RECORD];
  }

  toJsonLd(): AccessControlRecord<UserData> {
    return Object.assign({}, this, {
      "@context": Object.assign({}, RECORD_CONTEXT, USER_CONTEXT),
    });
  }
}

export class UserGroupAccessControlRecord extends AbstractAccessControlRecord<UserGroupData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [VocabularyUtils.USERGROUP_ACCESS_RECORD];
  }

  toJsonLd(): AccessControlRecord<UserGroupData> {
    return Object.assign({}, this, {
      "@context": Object.assign({}, RECORD_CONTEXT, USERGROUP_CONTEXT),
    });
  }
}

export class UserRoleAccessControlRecord extends AbstractAccessControlRecord<UserRoleData> {
  public constructor(data: AccessControlRecord<any>) {
    super(data);
    this.types = [VocabularyUtils.USERROLE_ACCESS_RECORD];
  }

  toJsonLd(): AccessControlRecord<UserRoleData> {
    return Object.assign({}, this, {
      "@context": Object.assign({}, RECORD_CONTEXT, USERROLE_CONTEXT),
    });
  }
}
