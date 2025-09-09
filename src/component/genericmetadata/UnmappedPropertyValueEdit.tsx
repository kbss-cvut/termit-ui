import React from "react";
import { useI18n } from "../hook/useI18n";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import CustomInput from "../misc/CustomInput";
import { GoPlus } from "react-icons/go";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import RdfsResource, { RdfsResourceData } from "../../model/RdfsResource";
import CreatePropertyForm from "./CreatePropertyForm";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { createProperty, getProperties } from "../../action/AsyncActions";
import { clearProperties } from "../../action/SyncActions";
import TermItState from "../../model/TermItState";
import Constants from "../../util/Constants";
import { PropertyValueType } from "../../model/WithUnmappedProperties";

function prepareKnownPropertiesForRendering(
  knownProperties: RdfsResource[],
  propertiesToIgnore: string[]
) {
  const options = knownProperties.map((p) => {
    const iriAsLabel = {};
    iriAsLabel[Constants.DEFAULT_LANGUAGE] = p.iri;
    return p.label
      ? p
      : new RdfsResource(Object.assign(p, { label: iriAsLabel }));
  });
  if (propertiesToIgnore.length === 0) {
    return options;
  }
  return options.filter((opt) => propertiesToIgnore.indexOf(opt.iri) === -1);
}

export const UnmappedPropertyValueEdit: React.FC<{
  language: string;
  languages: string[];
  propertiesToIgnore: string[];
  onChange: (property: string, value: PropertyValueType) => void;
}> = ({ language, languages, propertiesToIgnore, onChange }) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [property, setProperty] = React.useState<RdfsResource | null>(null);
  const [value, setValue] = React.useState("");
  const [showCreatePropertyForm, setShowCreatePropertyForm] =
    React.useState(false);
  const knownProperties = useSelector((state: TermItState) => state.properties);

  const isValid = property !== null && value.trim().length > 0;

  const onCreateProperty = (propertyData: RdfsResourceData) => {
    const property = new RdfsResource(propertyData);
    setProperty(property);
    dispatch(createProperty(property)).then(() => {
      dispatch(clearProperties());
      dispatch(getProperties());
    });
  };
  const onAdd = () => {
    onChange(property!.iri, value);
    setValue("");
  };
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid) {
      onAdd();
    }
  };

  return (
    <Row>
      <Col xl={6} md={12}>
        {showCreatePropertyForm && (
          <CreatePropertyForm
            onOptionCreate={onCreateProperty}
            toggleModal={() => setShowCreatePropertyForm(false)}
            languages={languages}
            language={language}
          />
        )}
        <FormGroup>
          <div className="d-flex justify-content-between">
            <Label className="attribute-label">
              {i18n("properties.edit.property")}
            </Label>
            <Button
              color="primary"
              size="sm"
              className="align-self-end create-property-button"
              title={i18n("properties.edit.new")}
              onClick={() => setShowCreatePropertyForm(true)}
            >
              {i18n("properties.edit.new")}
            </Button>
          </div>
          {knownProperties.length > 0 ? (
            <IntelligentTreeSelect
              className="term-edit"
              value={property}
              onChange={setProperty}
              childrenKey="children"
              valueKey="iri"
              getOptionLabel={(opt: RdfsResourceData) =>
                getLocalized(opt.label, getShortLocale(locale))
              }
              maxHeight={150}
              multi={false}
              renderAsTree={false}
              simpleTreeData={true}
              options={prepareKnownPropertiesForRendering(
                knownProperties,
                propertiesToIgnore
              )}
              placeholder=""
              classNamePrefix="react-select"
              noResultsText={i18n("search.no-results")}
            />
          ) : (
            <CustomInput disabled={true} />
          )}
        </FormGroup>
      </Col>
      <Col xl={5} md={11} className="align-self-end">
        <CustomInput
          name="value"
          label={i18n("properties.edit.value")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={onKeyPress}
        />
      </Col>
      <Col md={1} className="form-group align-self-end">
        <Button
          color="primary"
          size="sm"
          title={i18n("properties.edit.add.title")}
          onClick={onAdd}
          disabled={!isValid}
        >
          <GoPlus /> {i18n("properties.edit.add.text")}
        </Button>
      </Col>
    </Row>
  );
};
