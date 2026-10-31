import { context, MultilingualString } from "./MultilingualString";
import VocabularyUtils from "../util/VocabularyUtils";
import { HasIdentifier } from "./Asset";
import {
  CONTEXT as CUSTOM_ATTRIBUTE_CONTEXT,
  CustomAttribute,
} from "./RdfsResource";
import Utils from "../util/Utils";
import JsonLdUtils from "../util/JsonLdUtils";

export const PROFILE_DESCRIPTION_CONTEXT = {
  iri: "@id",
  title: context(VocabularyUtils.DC_TITLE),
  description: context(VocabularyUtils.DC_DESCRIPTION),
};

export const PROFILE_CONTEXT = {
  ...PROFILE_DESCRIPTION_CONTEXT,
  customAttributes: {
    "@id": VocabularyUtils.HAS_CUSTOM_ATTRIBUTE,
    "@container": "@set",
    "@context": CUSTOM_ATTRIBUTE_CONTEXT,
  },
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
    validate(this);
  }

  public toJsonLd() {
    return JsonLdUtils.toJsonLd(this, PROFILE_CONTEXT);
  }
}

function validate(data: CustomAttributesProfileData) {
  const prefix = "Invalid profile: ";
  if (!Utils.isUri(data.iri)) {
    throw new Error(
      prefix + "Invalid IRI supplied for Custom Attributes profile: " + data.iri
    );
  }
  if (!data.title || Object.keys(data.title).length === 0) {
    throw new Error(prefix + "Missing title for custom Attributes profile");
  }
  if (
    !Array.isArray(data.customAttributes) ||
    data.customAttributes.length === 0
  ) {
    throw new Error(
      prefix + "No custom attributes specified for Custom Attributes profile"
    );
  }
}
