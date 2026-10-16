import React from "react";
import SearchParam, { MatchType } from "../../../model/search/SearchParam";
import { FormGroup, Label } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import CustomInput from "../../misc/CustomInput";
import CustomToggle from "../../misc/CustomToggle";

interface TextFacetProps {
  id: string;
  label: string;
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
  disableMatchTypeToggle?: boolean;
}

const TextFacet: React.FC<TextFacetProps> = ({
  id,
  label,
  value,
  onChange,
  disableMatchTypeToggle,
}) => {
  const onMatchTypeToggle = () => {
    const result: SearchParam = { ...value };
    result.matchType =
      result.matchType === MatchType.EXACT_MATCH
        ? MatchType.SUBSTRING
        : MatchType.EXACT_MATCH;
    onChange(result);
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result: SearchParam = { ...value };
    result.value = [e.currentTarget.value];
    onChange(result);
  };
  return (
    <>
      <FormGroup>
        <div className="d-flex justify-content-between align-items-end mb-2">
          <Label className="attribute-label mb-0">{label}</Label>
          {value.matchType !== MatchType.IRI && !disableMatchTypeToggle && (
            <ExactMatchToggle
              active={value.matchType === MatchType.EXACT_MATCH}
              id={`${id}-matchType-toggle`}
              onToggle={onMatchTypeToggle}
            />
          )}
        </div>
        <CustomInput
          id={id}
          onChange={onInputChange}
          value={value.value.length > 0 ? value.value[0] : ""}
        />
      </FormGroup>
    </>
  );
};

const ExactMatchToggle: React.FC<{
  active: boolean;
  id: string;
  onToggle: () => void;
}> = ({ active, id, onToggle }) => {
  const { i18n } = useI18n();
  return (
    <CustomToggle
      id={id}
      onClick={onToggle}
      on={i18n("search.faceted.matchType.exact")}
      off={i18n("search.faceted.matchType.substring")}
      active={active}
    />
  );
};

export default TextFacet;
