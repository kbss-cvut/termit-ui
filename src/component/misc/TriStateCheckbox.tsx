import React from "react";
import { renderHelp, renderHint } from "./AbstractInput";
import { Input, Label } from "reactstrap";
import classNames from "classnames";
import VocabularyUtils from "../../util/VocabularyUtils";

export interface TriStateCheckboxProps {
  id: string;
  label?: string;
  labelClass?: string;
  className?: string;
  checked?: boolean | string;
  onChange: (value: boolean | string) => void;
  help?: string;
  hint?: string | React.ReactElement;
}

export const TriStateCheckbox: React.FC<TriStateCheckboxProps> = ({
  id,
  label,
  labelClass,
  className,
  checked,
  hint,
  help,
  onChange,
}) => {
  const el = React.useRef<HTMLInputElement>(null);

  const onChangeHandler = React.useCallback(() => {
    const nextValue =
      checked == true
        ? false
        : checked == false
        ? VocabularyUtils.RDF_NIL
        : true;
    onChange(nextValue);
  }, [checked, onChange]);

  React.useEffect(() => {
    (el.current as any).checked = checked === true;
    (el.current as any).indeterminate = checked === VocabularyUtils.RDF_NIL;
  }, [checked]);

  return (
    <>
      <Input
        type="checkbox"
        innerRef={el}
        className={className}
        onChange={onChangeHandler}
      />
      &nbsp;
      {label ? (
        <Label className={classNames("attribute-label", labelClass)}>
          {label}
          {renderHelp(id, help)}
        </Label>
      ) : null}
      {renderHint(hint)}
    </>
  );
};
