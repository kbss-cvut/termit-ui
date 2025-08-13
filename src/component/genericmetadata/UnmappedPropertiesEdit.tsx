import * as React from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { getProperties } from "../../action/AsyncActions";
import Utils from "../../util/Utils";
import AttributeSectionContainer from "../layout/AttributeSectionContainer";
import "./UnmappedProperties.scss";
import { PropertyValueType } from "../../model/WithUnmappedProperties";
import { CustomAttributesValuesEdit } from "./CustomAttributesValuesEdit";
import { UnmappedPropertyValueEdit } from "./UnmappedPropertyValueEdit";
import UnmappedProperties from "./UnmappedProperties";
import { useI18n } from "../hook/useI18n";

interface UnmappedPropertiesEditProps {
  properties: Map<string, PropertyValueType[]>;
  ignoredProperties?: string[]; // Properties that should not be offered in the editor
  onChange: (properties: Map<string, PropertyValueType[]>) => void;
  languages: string[];
  language: string;
}

const UnmappedPropertiesEdit: React.FC<UnmappedPropertiesEditProps> = ({
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

  const onRemove = (property: string, value: PropertyValueType) => {
    const newProperties = new Map(properties);
    const propValues = newProperties.get(property)!;
    if (propValues.length === 1) {
      newProperties.delete(property);
    } else {
      propValues.splice(propValues.indexOf(value), 1);
    }
    onChange(newProperties);
  };
  const onPropertyValueChange = (
    attribute: string,
    value: PropertyValueType[]
  ) => {
    const newProperties = new Map(properties);
    newProperties.set(attribute, value);
    onChange(newProperties);
  };
  const onSingleValueAdded = (property: string, value: PropertyValueType) => {
    const newValue = properties.has(property)
      ? properties.get(property)!.slice()
      : [];
    newValue.push(value);
    onPropertyValueChange(property, newValue);
  };

  return (
    <AttributeSectionContainer label={i18n("properties.edit.title")}>
      <CustomAttributesValuesEdit
        values={properties}
        onChange={onPropertyValueChange}
      />
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
  );
};

export default UnmappedPropertiesEdit;
