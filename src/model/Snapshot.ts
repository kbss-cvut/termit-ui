import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, HasTypes } from "./Asset";
import { CONTEXT as USER_CONTEXT, UserData } from "./User";

const ctx = {
  created: {
    "@id": `${VocabularyUtils.PREFIX}m\u00e1-datum-a-\u010das-vytvo\u0159en\u00ed-verze`,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  author: "http://purl.org/dc/terms/creator",
  versionOf: `${VocabularyUtils.PREFIX}/je-verz\u00ed`,
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
