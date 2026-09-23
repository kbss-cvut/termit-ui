import React from "react";
import { TermSelector } from "../../term/TermSelector";
import Term from "../../../model/Term";
import SearchParam from "../../../model/search/SearchParam";
import { Label } from "reactstrap";

export const TermSelectorFacet: React.FC<{
  id: string;
  label: string;
  value: SearchParam;
  onChange: (value: SearchParam) => void;
  vocabularyIri?: string;
  includeImported?: boolean;
  disableScopeToggle?: boolean;
}> = ({
  id,
  label,
  value,
  onChange,
  vocabularyIri,
  includeImported,
  disableScopeToggle,
}) => {
  const onSelect = (values: readonly Term[]) => {
    onChange({ ...value, value: values.map((v) => v.iri) });
  };

  return (
    <TermSelector
      id={id}
      label={<Label className="attribute-label mb-0">{label}</Label>}
      value={value.value}
      onChange={onSelect}
      forceFlatList={true}
      vocabularyIri={vocabularyIri}
      includeImported={includeImported}
      disableScopeToggle={disableScopeToggle}
    />
  );
};
