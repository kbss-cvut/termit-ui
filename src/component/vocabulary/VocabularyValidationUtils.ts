import {
  hasNonBlankValue,
  MultilingualString,
} from "../../model/MultilingualString";

export function isValid(label: MultilingualString): boolean {
  return Object.keys(label).every((lang) => hasNonBlankValue(label, lang));
}
