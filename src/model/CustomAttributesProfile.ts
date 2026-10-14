import { context, MultilingualString } from "./MultilingualString";
import VocabularyUtils from "../util/VocabularyUtils";
import { HasIdentifier } from "./Asset";
import { CustomAttribute } from "./RdfsResource";

export const PROFILE_DESCRIPTION_CONTEXT = {
  iri: "@id",
  title: context(VocabularyUtils.DC_TITLE),
  description: context(VocabularyUtils.DC_DESCRIPTION),
};

export const PROFILE_CONTEXT = {
  ...PROFILE_DESCRIPTION_CONTEXT,
  customAttributes: VocabularyUtils.HAS_CUSTOM_ATTRIBUTE,
};

export interface CustomAttributesProfileDescriptionData extends HasIdentifier {
  title: MultilingualString;
  description?: MultilingualString;
}

export interface CustomAttributesProfileData
  extends CustomAttributesProfileDescriptionData {
  customAttributes: CustomAttribute[];
}

export class CustomAttributesProfile implements CustomAttributesProfileData {
  public readonly iri: string;
  public readonly title: MultilingualString;
  public readonly description?: MultilingualString;
  public readonly customAttributes: CustomAttribute[];

  constructor(data: CustomAttributesProfileData) {
    this.iri = data.iri;
    this.title = data.title;
    this.description = data.description;
    this.customAttributes = data.customAttributes;
  }
}
