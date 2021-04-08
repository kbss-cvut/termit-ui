import * as React from "react";
import {FormGroup} from "reactstrap";
import "./StatusFilter.scss";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import classNames from "classnames";
import {useI18n} from "../hook/useI18n";

interface StatusFilterProps {
    id: string; // Toggle id, required by the tooltip component
    draft: boolean;
    confirmed: boolean;
    onDraftOnlyToggle: () => void;
    onConfirmedOnlyToggle: () => void;
}

const StatusFilter: React.FC<StatusFilterProps> = props => {
    const {i18n} = useI18n();
    const cls = classNames("checkbox");
    return (
        <FormGroup id={props.id} className={"mb-0"}>
            <CustomCheckBoxInput
                name="glossary.filter-confirmedOnly"
                checked={props.confirmed}
                disabled={!props.draft}
                onChange={props.onConfirmedOnlyToggle}
                className={cls}
                label={i18n("glossary.filter-confirmed")}
            />
            &nbsp;&nbsp;
            <CustomCheckBoxInput
                name="glossary.filter-draftOnly"
                checked={props.draft}
                disabled={!props.confirmed}
                onChange={props.onDraftOnlyToggle}
                className={cls}
                label={i18n("glossary.filter-draft")}
            />
        </FormGroup>
    );
};

export default StatusFilter;
