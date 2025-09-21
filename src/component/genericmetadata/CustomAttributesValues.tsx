import React from "react";
import { useI18n } from "../hook/useI18n";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
// @ts-ignore
import { Badge, Col, Label, List, Row } from "reactstrap";
import Utils from "../../util/Utils";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { RdfProperty } from "../../model/RdfsResource";
import {
  HasUnmappedProperties,
  PropertyValueType,
  stringifyPropertyValue,
} from "../../model/WithUnmappedProperties";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermIriLink from "../term/TermIriLink";
import { ThunkDispatch } from "../../util/Types";
import { getCustomAttributes } from "../../action/AsyncActions";
import OutgoingLink from "../misc/OutgoingLink";

export const CustomAttributesValues: React.FC<{
  asset: HasUnmappedProperties;
}> = ({ asset }) => {
  const { locale } = useI18n();
  const lang = getShortLocale(locale);
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  return (
    <>
      {customAttributes
        .filter((att) => asset.unmappedProperties.has(att.iri))
        .map((att) => (
          <Row key={Utils.hashCode(att.iri)}>
            <Col xl={2} md={4}>
              <Label
                className="attribute-label mb-3"
                title={getLocalized(att.comment, lang)}
              >
                {getLocalized(att.label, lang)}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              {Utils.sanitizeArray(asset.unmappedProperties.get(att.iri))
                .length === 1 ? (
                <CustomAttributeValue
                  attribute={att}
                  value={asset.unmappedProperties.get(att.iri)![0]}
                />
              ) : (
                <List type="unstyled" className="mb-3">
                  {asset.unmappedProperties.get(att.iri)?.map((val) => (
                    <li key={stringifyPropertyValue(val)}>
                      <CustomAttributeValue attribute={att} value={val} />
                    </li>
                  ))}
                </List>
              )}
            </Col>
          </Row>
        ))}
    </>
  );
};

const CustomAttributeValue: React.FC<{
  attribute: RdfProperty;
  value: PropertyValueType;
}> = ({ attribute, value }) => {
  const strValue = stringifyPropertyValue(value);
  switch (attribute.rangeIri) {
    case VocabularyUtils.TERM:
      return <TermIriLink iri={strValue} showVocabularyBadge={true} />;
    case VocabularyUtils.XSD_BOOLEAN:
      return (
        <Badge
          color={value["@value"] ? "success" : "dark"}
          pill={true}
          className="align-text-top"
        >
          {strValue}
        </Badge>
      );
    default:
      return (
        <>
          {Utils.isLink(strValue) ? (
            <OutgoingLink label={strValue} iri={strValue} />
          ) : (
            strValue
          )}
        </>
      );
  }
};
