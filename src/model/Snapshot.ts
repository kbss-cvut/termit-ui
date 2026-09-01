import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, HasTypes } from "./Asset";
import { CONTEXT as USER_CONTEXT, UserData } from "./User";

const ctx = {
  created: {
    "@id": VocabularyUtils.SNAPSHOT_CREATED,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  author: VocabularyUtils.SNAPSHOT_AUTHOR,
  versionOf: VocabularyUtils.PREFIX + "is-version-of",
};

export const CONTEXT = Object.assign({}, ctx, USER_CONTEXT, ASSET_CONTEXT);

export default interface SnapshotData extends HasTypes {
  iri: string;
  created: string;
  author?: UserData;
  versionOf: { iri: string };
  types: string[];
}

export interface SupportsSnapshots {
  isSnapshot: () => boolean;

  snapshotOf: () => string | undefined;

  snapshotCreated: () => string | undefined;

  snapshotAuthor: () => UserData | undefined;
}
