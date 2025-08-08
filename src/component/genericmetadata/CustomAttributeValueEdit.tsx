import React from "react";
import { RdfProperty } from "../../model/RdfsResource";
import { PropertyValueType } from "../../model/WithUnmappedProperties";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import StringListEdit from "../misc/StringListEdit";

export const CustomAttributeValueEdit: React.FC<{
  attribute: RdfProperty;
  values: PropertyValueType[];
  onChange: (attribute: RdfProperty, values: PropertyValueType[]) => void;
}> = ({ attribute, values, onChange }) => {
  const { locale } = useI18n();
  const lang = getShortLocale(locale);
  if (attribute.rangeIri === VocabularyUtils.XSD_BOOLEAN) {
    const checked = values.length > 0 && values[0] === "true";
    return (
      <div className="form-group">
        <CustomCheckBoxInput
          checked={checked}
          onChange={() => onChange(attribute, [!checked])}
          label={getLocalized(attribute.label, lang)}
          title={getLocalized(attribute.comment, lang)}
        />
      </div>
    );
  }
  if (attribute.rangeIri === VocabularyUtils.XSD_STRING) {
    return (
      <div className="form-group">
        <StringListEdit
          onChange={(newList) => onChange(attribute, newList)}
          list={values as string[]}
          label={getLocalized(attribute.label, lang)}
          helpText={getLocalized(attribute.comment, lang)}
        />
      </div>
    );
  }
  return <div className="form-group">TODO</div>;
};
