import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, HasTypes } from "./Asset";

const ctx = {
  created: `${VocabularyUtils.PREFIX}m\u00e1-datum-a-\u010das-vytvo\u0159en\u00ed-verze`,
  versionOf: `${VocabularyUtils.PREFIX}/je-verz\u00ed`,
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT);

export default interface SnapshotData extends HasTypes {
  iri: string;
  created: string;
  versionOf: { iri: string };
  types: string[];
}

export interface SupportsSnapshots {
  isSnapshot: () => boolean;

  snapshotOf: () => string | undefined;

  snapshotCreated: () => string | undefined;
}
