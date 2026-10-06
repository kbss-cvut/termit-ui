import * as React from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { getProperties } from "../../action/AsyncActions";
import Utils from "../../util/Utils";
import AttributeSectionContainer from "../layout/AttributeSectionContainer";
import "./UnmappedProperties.scss";
import {
  PropertyValuesType,
  PropertyValueType,
  stringifyPropertyValue,
} from "../../model/WithUnmappedProperties";
import { CustomAttributesValuesEdit } from "./CustomAttributesValuesEdit";
import { UnmappedPropertyValueEdit } from "./UnmappedPropertyValueEdit";
import UnmappedProperties from "./UnmappedProperties";
import { useI18n } from "../hook/useI18n";
import { PluralMultilingualString } from "../../model/MultilingualString";

interface UnmappedPropertiesEditProps {
  assetType: "term" | "vocabulary";
  properties: Map<string, PropertyValuesType>;
  ignoredProperties?: string[]; // Properties that should not be offered in the editor
  onChange: (properties: Map<string, PropertyValuesType>) => void;
  languages: string[];
  language: string;
}

const UnmappedPropertiesEdit: React.FC<UnmappedPropertiesEditProps> = ({
  assetType,
  properties,
  ignoredProperties,
  onChange,
  languages,
  language,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getProperties());
  }, [dispatch]);

  const onRemove = (property: string, valueToRemove: string) => {
    const newProperties = new Map(properties);
    const propValues = newProperties.get(property)!;
    if (Array.isArray(propValues)) {
      if (propValues.length === 1) {
        newProperties.delete(property);
      } else {
        const indexToRemove = propValues.findIndex(
          (v) => stringifyPropertyValue(v) === valueToRemove
        );
        if (indexToRemove >= 0) {
          propValues.splice(indexToRemove, 1);
        }
      }
    } else {
      const pv = propValues as PluralMultilingualString;
      pv[language] = pv[language].filter((v) => v !== valueToRemove);
    }
    onChange(newProperties);
  };
  const onPropertyValueChange = (
    attribute: string,
    value: PropertyValuesType
  ) => {
    const newProperties = new Map(properties);
    newProperties.set(attribute, value);
    onChange(newProperties);
  };
  const onSingleValueAdded = (property: string, value: PropertyValueType) => {
    const newValue = properties.has(property)
      ? (properties.get(property) as PropertyValueType[])!.slice()
      : [];
    newValue.push(value);
    onPropertyValueChange(property, newValue);
  };

  return (
    <>
      <AttributeSectionContainer
        label={i18n("administration.customization.customAttributes.title")}
      >
        <CustomAttributesValuesEdit
          assetType={assetType}
          values={properties}
          onChange={onPropertyValueChange}
          language={language}
        />
      </AttributeSectionContainer>
      <AttributeSectionContainer label={i18n("properties.edit.title")}>
        <UnmappedProperties
          properties={properties}
          onRemove={onRemove}
          showInfoOnEmpty={false}
        />
        <UnmappedPropertyValueEdit
          language={language}
          languages={languages}
          propertiesToIgnore={Utils.sanitizeArray(ignoredProperties)}
          onChange={onSingleValueAdded}
        />
      </AttributeSectionContainer>
    </>
  );
};

export default UnmappedPropertiesEdit;
