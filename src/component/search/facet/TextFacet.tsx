import React from "react";
import SearchParam, { MatchType } from "../../../model/search/SearchParam";
import { FormGroup, Input, Label } from "reactstrap";
import Toggle from "react-bootstrap-toggle";
import { useI18n } from "../../hook/useI18n";
import "../../misc/CustomToggle.scss";

interface TextFacetProps {
  id: string;
  label: string;
  value: SearchParam;
  onChange: (newValue: SearchParam) => void;
}

const TextFacet: React.FC<TextFacetProps> = ({
  id,
  label,
  value,
  onChange,
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
      <FormGroup className="mb-0">
        <div className="d-flex justify-content-between">
          <Label className="attribute-label">{label}</Label>
          <ExactMatchToggle
            active={value.matchType === MatchType.EXACT_MATCH}
            id={`${id}-matchType-toggle`}
            onToggle={onMatchTypeToggle}
          />
        </div>
        <Input
          bsSize="sm"
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
  let toggleStyle = {
    height: "calc(1.5 * 0.875rem + 0.5rem + 2px)",
    margin: "0 0 0.125rem 0",
    alignSelf: "flex-end",
  };
  return (
    <Toggle
      id={id}
      onClick={onToggle}
      on={i18n("search.faceted.matchType.exact")}
      off={i18n("search.faceted.matchType.substring")}
      onstyle="primary"
      offstyle="secondary"
      size="sm"
      onClassName="toggle-custom"
      offClassName="toggle-custom"
      handleClassName="toggle-handle-custom"
      style={toggleStyle}
      active={active}
      recalculateOnResize={true}
    />
  );
};

export default TextFacet;
