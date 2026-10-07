import Utils from "../util/Utils";
import { HasIdentifier } from "./Asset";
import { PluralMultilingualString } from "./MultilingualString";

export type TypedLiteral = {
  "@value": boolean | number | string;
  "@type": string;
};

export type PropertyValueType =
  | HasIdentifier
  | TypedLiteral
  | string
  | boolean
  | number;

export type PropertyValuesType =
  | PropertyValueType[]
  | PluralMultilingualString
  | PluralMultilingualString[];

export interface HasUnmappedProperties {
  get unmappedProperties(): Map<string, PropertyValuesType>;
  set unmappedProperties(properties: Map<string, PropertyValuesType>);
}

/**
 * Converts an unmapped property value to a string.
 * @param value Unmapped property value
 */
export function stringifyPropertyValue(
  value: PropertyValueType | PluralMultilingualString
): string {
  if ((value as HasIdentifier).iri) {
    return (value as HasIdentifier).iri;
  } else if ((value as TypedLiteral)["@value"] !== undefined) {
    return (value as TypedLiteral)["@value"].toString();
  } else if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  } else {
    return value === null ? "null" : value.toString();
  }
}

export function extractPropertyValue(
  value: PropertyValueType
): string | number | boolean {
  if ((value as HasIdentifier).iri) {
    return (value as HasIdentifier).iri;
  } else if ((value as TypedLiteral)["@value"] !== undefined) {
    return (value as TypedLiteral)["@value"] as any;
  } else {
    return value as string;
  }
}

/**
 * Common logic for classes implementing support for unmapped properties.
 */
const WithUnmappedProperties = {
  getUnmappedProperties(
    instance: any,
    mappedProperties: string[]
  ): Map<string, PropertyValuesType> {
    const map = new Map<string, PropertyValuesType>();
    Object.getOwnPropertyNames(instance)
      .filter((p) => mappedProperties.indexOf(p) === -1)
      .forEach((prop) => {
        const values: PropertyValuesType = Utils.sanitizeArray(instance[prop]);
        map.set(prop, values);
      });
    return map;
  },

  setUnmappedProperties(
    instance: any,
    properties: Map<string, PropertyValuesType>,
    mappedProperties: string[]
  ) {
    // Remove all unmapped properties
    Object.getOwnPropertyNames(instance)
      .filter((p) => mappedProperties.indexOf(p) === -1)
      .forEach((p) => delete instance[p]);
    // Set new values for unmapped properties
    properties.forEach((value, key) => (instance[key] = value));
  },
};

export default WithUnmappedProperties;
