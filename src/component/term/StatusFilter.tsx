import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {FormGroup} from "reactstrap";
import "./StatusFilter.scss";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import classNames from "classnames";

interface StatusFilterProps extends HasI18n {
    id: string; // Toggle id, required by the tooltip component
    draft: boolean;
    confirmed: boolean;
    onDraftOnlyToggle: () => void;
    onConfirmedOnlyToggle: () => void;
}

const StatusFilter: React.FC<StatusFilterProps> = props => {
    const cls = classNames("checkbox");
    return <FormGroup id={props.id} className={"mb-0"}>
        <CustomCheckBoxInput
            name="glossary.filter-confirmedOnly"
            checked={props.confirmed}
            disabled={!props.draft}
            onChange={props.onConfirmedOnlyToggle}
            className={cls}
            label={props.i18n("glossary.filter-confirmed")}/>
            &nbsp;&nbsp;
        <CustomCheckBoxInput
            name="glossary.filter-draftOnly"
            checked={props.draft}
            disabled={!props.confirmed}
            onChange={props.onDraftOnlyToggle}
            className={cls}
            label={props.i18n("glossary.filter-draft")}/>
    </FormGroup>
};

export default injectIntl(withI18n(StatusFilter));
