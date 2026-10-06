import React from "react";
import { useI18n } from "../hook/useI18n";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
// @ts-ignore
import { Badge, Col, Label, List, Row } from "reactstrap";
import Utils from "../../util/Utils";
import {
  getLocalized,
  MultilingualString,
} from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { CustomAttribute, RdfProperty } from "../../model/RdfsResource";
import {
  HasUnmappedProperties,
  PropertyValueType,
  stringifyPropertyValue,
} from "../../model/WithUnmappedProperties";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermIriLink from "../term/TermIriLink";
import { ThunkDispatch } from "../../util/Types";
import { getCustomAttributes } from "../../action/AsyncCustomizationActions";
import OutgoingLink from "../misc/OutgoingLink";
import { RelationshipAnnotationButton } from "../term/relationship-annotation/RelationshipAnnotationButton";
import { HasIdentifier } from "../../model/Asset";

export const CustomAttributesValues: React.FC<{
  asset: HasUnmappedProperties & HasIdentifier & { label: MultilingualString };
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
                renderValue(
                  att,
                  asset.unmappedProperties.get(att.iri)![0],
                  asset,
                  lang
                )
              ) : (
                <List type="unstyled" className="mb-3">
                  {asset.unmappedProperties.get(att.iri)?.map((val) => (
                    <li key={stringifyPropertyValue(val)}>
                      {renderValue(att, val, asset, lang)}
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

function renderValue(
  att: CustomAttribute,
  val: PropertyValueType,
  asset: HasUnmappedProperties &
    HasIdentifier & {
      label: MultilingualString;
    },
  lang: string
) {
  return (
    <>
      <CustomAttributeValue attribute={att} value={val} />
      {(val as any).iri && (
        <RelationshipAnnotationButton
          relationship={{
            subject: asset,
            predicate: att.iri,
            predicateLabel: getLocalized(att.label, lang),
            object: val as HasIdentifier & {
              label: MultilingualString;
            },
          }}
        />
      )}
    </>
  );
}

export const CustomAttributeValue: React.FC<{
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
