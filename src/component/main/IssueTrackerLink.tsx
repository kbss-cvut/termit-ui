import * as React from "react";
import {Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import "./IssueTrackerLink.scss";

const IssueTrackerLink: React.FC<HasI18n> = props => {
    const {i18n} = props;
    const [isOpen, setOpen] = React.useState(false);

    return <ButtonDropdown id="issue-tracker-link" isOpen={isOpen} toggle={() => setOpen(!isOpen)}>
        <Button id="issue-tracker-link-toggle" size="sm" color="warning">
            <a href={process.env.REACT_APP_REPORT_BUG_LINK} target="_blank" rel="noreferrer">
                {i18n("main.issue-tracker.reportBug")}
            </a>
        </Button>
        <DropdownToggle split={true} caret={true} color="warning"/>
        <DropdownMenu right={true}>
            <DropdownItem className="btn-sm">
                <a href={process.env.REACT_APP_REQUEST_FEATURE_LINK} target="_blank" rel="noreferrer">
                    {i18n("main.issue-tracker.requestFeature")}
                </a>
            </DropdownItem>
        </DropdownMenu>
    </ButtonDropdown>
};

export default injectIntl(withI18n(IssueTrackerLink));
