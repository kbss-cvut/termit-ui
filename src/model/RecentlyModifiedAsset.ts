import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, AssetData, HasTypes } from "./Asset";
import User, { CONTEXT as USER_CONTEXT, UserData } from "./User";
import Utils from "../util/Utils";

const ctx = {
  label: VocabularyUtils.RDFS_LABEL,
  modified: VocabularyUtils.DC_MODIFIED,
  editor: VocabularyUtils.PREFIX + "má-editora",
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT, USER_CONTEXT);

export interface RecentlyModifiedAssetData extends HasTypes {
  iri: string;
  label: string;
  types: string[];
  modified: number;
  editor: UserData;
  vocabulary?: AssetData;
}

export default class RecentlyModifiedAssets
  implements RecentlyModifiedAssetData {
  public readonly iri: string;
  public readonly label: string;
  public readonly types: string[];
  public readonly modified: number;
  public readonly editor: User;
  public readonly vocabulary?: AssetData;

  constructor(data: RecentlyModifiedAssetData) {
    this.iri = data.iri;
    this.label = data.label;
    this.modified = data.modified;
    this.vocabulary = data.vocabulary;
    this.editor = new User(data.editor);
    this.types = Utils.sanitizeArray(data.types);
  }
}
