import Utils from "../util/Utils";
import { HasIdentifier } from "./Asset";

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

/**
 * Converts an unmapped property value to a string.
 * @param value Unmapped property value
 */
export function stringifyPropertyValue(value: PropertyValueType): string {
  if ((value as HasIdentifier).iri) {
    return (value as HasIdentifier).iri;
  } else if ((value as TypedLiteral)["@value"]) {
    return (value as TypedLiteral)["@value"].toString();
  } else {
    return value.toString();
  }
}

/**
 * Common logic for classes implementing support for unmapped properties.
 */
const WithUnmappedProperties = {
  getUnmappedProperties(
    instance: any,
    mappedProperties: string[]
  ): Map<string, PropertyValueType[]> {
    const map = new Map<string, PropertyValueType[]>();
    Object.getOwnPropertyNames(instance)
      .filter((p) => mappedProperties.indexOf(p) === -1)
      .forEach((prop) => {
        const values: string[] = Utils.sanitizeArray(instance[prop]);
        map.set(prop, values);
      });
    return map;
  },

  setUnmappedProperties(
    instance: any,
    properties: Map<string, PropertyValueType[]>,
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
