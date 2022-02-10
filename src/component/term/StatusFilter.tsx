import * as React from "react";
import { FormGroup } from "reactstrap";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import { useI18n } from "../hook/useI18n";
import "./StatusFilter.scss";

interface StatusFilterProps {
  id: string; // Toggle id, required by the tooltip component
  draft: boolean;
  confirmed: boolean;
  onDraftOnlyToggle: () => void;
  onConfirmedOnlyToggle: () => void;
}

const StatusFilter: React.FC<StatusFilterProps> = (props) => {
  const { i18n } = useI18n();
  return (
    <FormGroup id={props.id} className={"mb-0"}>
      <CustomCheckBoxInput
        name="glossary.filter-confirmedOnly"
        checked={props.confirmed}
        disabled={!props.draft}
        onChange={props.onConfirmedOnlyToggle}
        className="status-filter-checkbox"
        label={i18n("glossary.filter-confirmed")}
      />
      &nbsp;&nbsp;
      <CustomCheckBoxInput
        name="glossary.filter-draftOnly"
        checked={props.draft}
        disabled={!props.confirmed}
        onChange={props.onDraftOnlyToggle}
        className="status-filter-checkbox"
        label={i18n("glossary.filter-draft")}
      />
    </FormGroup>
  );
};

export default StatusFilter;
