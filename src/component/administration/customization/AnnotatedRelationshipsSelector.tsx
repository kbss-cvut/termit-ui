import React from "react";
import { FormGroup, Label, Badge } from "reactstrap";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import HelpIcon from "../../misc/HelpIcon";
import { useI18n } from "../../hook/useI18n";
import { CustomAttribute } from "../../../model/RdfsResource";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { SelectorOption } from "./CustomAttributeSelector";
import { HasIdentifier } from "../../../model/Asset";

const SKOS_TERM_RELATIONSHIP_PROPERTIES = [
  {
    iris: [
      "http://www.w3.org/2004/02/skos/core#related",
      "http://www.w3.org/2004/02/skos/core#relatedMatch",
    ],
    labelKey: "term.metadata.related.title",
  },
  {
    iris: [
      "http://www.w3.org/2004/02/skos/core#broader",
      "http://www.w3.org/2004/02/skos/core#broadMatch",
    ],
    labelKey: "term.metadata.parent",
  },
  {
    iris: [
      "http://www.w3.org/2004/02/skos/core#narrower",
      "http://www.w3.org/2004/02/skos/core#narrowMatch",
    ],
    labelKey: "term.metadata.subTerms",
  },
  {
    iris: ["http://www.w3.org/2004/02/skos/core#exactMatch"],
    labelKey: "term.metadata.exactMatches",
  },
];

function getTermRelationshipProperties(
  customAttributes: CustomAttribute[],
  language: string,
  i18n: (key: string) => string
): SelectorOption[] {
  const basicOptions = SKOS_TERM_RELATIONSHIP_PROPERTIES.map((p) => ({
    value: p.iris.join(","),
    label: i18n(p.labelKey),
  }));

  const customOptions = customAttributes
    .filter(
      (ca) =>
        ca.domainIri === VocabularyUtils.TERM &&
        ca.rangeIri === VocabularyUtils.TERM
    )
    .map((ca) => ({
      value: ca.iri,
      label: getLocalized(ca.label, language) || ca.iri,
    }));

  return [...basicOptions, ...customOptions];
}

/**
 * Converts backend annotatedRelationships array to UI representation by
 * grouping related SKOS properties under a single option.
 */
export function groupAnnotatedRelationships(
  relationships: HasIdentifier[]
): string[] {
  const iris = relationships.map((r) => r.iri);

  const groupedIris: string[] = [];
  const processedIris = new Set<string>();

  iris.forEach((iri) => {
    if (processedIris.has(iri)) return;

    const group = SKOS_TERM_RELATIONSHIP_PROPERTIES.find((p) =>
      p.iris.includes(iri)
    );

    if (group) {
      groupedIris.push(group.iris.join(","));
      group.iris.forEach((i) => processedIris.add(i));
    } else {
      groupedIris.push(iri);
      processedIris.add(iri);
    }
  });

  return groupedIris;
}

/**
 * Converts UI representation back to backend format by splitting grouped
 * values.
 */
export function ungroupAnnotatedRelationships(
  groupedValues: string[]
): Array<{ iri: string }> {
  return groupedValues.flatMap((value) =>
    value.includes(",")
      ? value.split(",").map((iri) => ({ iri }))
      : [{ iri: value }]
  );
}

interface AnnotatedRelationshipsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  customAttributes: CustomAttribute[];
  disabled?: boolean;
  initialValues?: string[];
}

export const AnnotatedRelationshipsSelector: React.FC<
  AnnotatedRelationshipsSelectorProps
> = ({ value, onChange, customAttributes, disabled, initialValues = [] }) => {
  const { i18n, locale } = useI18n();

  const termRelationshipOptions = React.useMemo(
    () =>
      getTermRelationshipProperties(
        customAttributes,
        getShortLocale(locale),
        i18n
      ),
    [customAttributes, locale, i18n]
  );

  const availableOptions = React.useMemo(
    () =>
      termRelationshipOptions.filter(
        (o) => !(initialValues || []).includes(o.value)
      ),
    [termRelationshipOptions, initialValues]
  );

  const handleChange = (selected: any) => {
    const newValues = selected ? selected.map((s: any) => s.value) : [];
    const union = Array.from(new Set([...(initialValues || []), ...newValues]));
    onChange(union);
  };

  const additionalValues: string[] = React.useMemo(
    () => value.filter((v) => !(initialValues || []).includes(v)),
    [value, initialValues]
  );

  return (
    <FormGroup>
      <Label className="attribute-label">
        {i18n(
          "administration.customization.customAttributes.annotatedRelationships"
        )}
        <HelpIcon
          id="annotated-relationships-help"
          text={i18n(
            "administration.customization.customAttributes.annotatedRelationships.help"
          )}
        />
      </Label>
      {initialValues && initialValues.length > 0 && (
        <div className="mb-2">
          {initialValues.map((iv) => {
            const opt = termRelationshipOptions.find((o) => o.value === iv);
            const text =
              opt && typeof opt.label === "string" ? opt.label : String(iv);
            return (
              <Badge key={iv} color="info" pill={true} className="m-1 p-2">
                {text}
              </Badge>
            );
          })}
        </div>
      )}
      <IntelligentTreeSelect
        id="custom-attribute-annotated-relationships"
        options={availableOptions}
        value={additionalValues.map(
          (iri) =>
            availableOptions.find((opt) => opt.value === iri) || {
              value: iri,
              label: iri,
            }
        )}
        valueKey="value"
        labelKey="label"
        multi={true}
        simpleTreeData={true}
        onChange={handleChange}
        classNamePrefix="react-select"
        placeholder={i18n("select.placeholder")}
        isDisabled={disabled}
        isClearable={false}
      />
    </FormGroup>
  );
};
