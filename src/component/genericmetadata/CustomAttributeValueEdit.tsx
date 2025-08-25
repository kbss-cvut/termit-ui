import React from "react";
import { RdfProperty } from "../../model/RdfsResource";
import {
  extractPropertyValue,
  PropertyValueType,
} from "../../model/WithUnmappedProperties";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import ValueListEdit from "../misc/ValueListEdit";
import { TermSelector } from "../term/TermSelector";
import Term from "src/model/Term";
import { Label } from "reactstrap";
import HelpIcon from "../misc/HelpIcon";
import Utils from "../../util/Utils";

export const CustomAttributeValueEdit: React.FC<{
  attribute: RdfProperty;
  values: PropertyValueType[];
  onChange: (attribute: RdfProperty, values: PropertyValueType[]) => void;
}> = ({ attribute, values, onChange }) => {
  const { locale } = useI18n();
  const lang = getShortLocale(locale);
  if (attribute.rangeIri === VocabularyUtils.XSD_BOOLEAN) {
    const checked =
      values.length > 0 && Boolean(extractPropertyValue(values[0]));
    return (
      <div className="form-group">
        <CustomCheckBoxInput
          checked={checked}
          onChange={() => onChange(attribute, [!checked])}
          label={getLocalized(attribute.label, lang)}
          title={getLocalized(attribute.comment, lang)}
          className="relative ml-0"
        />
      </div>
    );
  }
  if (attribute.rangeIri === VocabularyUtils.XSD_INT) {
    return (
      <div className="form-group">
        <ValueListEdit<number>
          type="number"
          onChange={(newList) => onChange(attribute, newList)}
          list={values.map((v) => extractPropertyValue(v)) as number[]}
          label={getLocalized(attribute.label, lang)}
          helpText={getLocalized(attribute.comment, lang)}
        />
      </div>
    );
  }
  if (attribute.rangeIri === VocabularyUtils.TERM) {
    return (
      <TermSelector
        value={values.map((v) => extractPropertyValue(v)) as string[]}
        onChange={(sel: Term[]) =>
          onChange(
            attribute,
            sel.map((t) => ({ iri: t.iri }))
          )
        }
        label={
          <Label className="attribute-label">
            {getLocalized(attribute.label, lang)}
            <HelpIcon
              id={`term-selector-${Utils.hashCode(attribute.iri)}`}
              text={getLocalized(attribute.comment, lang)}
            />
          </Label>
        }
      />
    );
  }
  if (attribute.rangeIri === VocabularyUtils.RDFS_RESOURCE) {
    return (
      <div className="form-group">
        <ValueListEdit
          onChange={(newList) =>
            onChange(
              attribute,
              newList.map((s) => ({ iri: s }))
            )
          }
          list={values.map((v) => extractPropertyValue(v)) as string[]}
          label={getLocalized(attribute.label, lang)}
          helpText={getLocalized(attribute.comment, lang)}
          validator={(s) => Utils.isUri(s)}
        />
      </div>
    );
  }
  return (
    <div className="form-group">
      <ValueListEdit
        onChange={(newList) => onChange(attribute, newList)}
        list={values as string[]}
        label={getLocalized(attribute.label, lang)}
        helpText={getLocalized(attribute.comment, lang)}
      />
    </div>
  );
};
