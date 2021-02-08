import * as React from "react";
import {Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";

const IssueTrackerLink: React.FC<HasI18n> = props => {
    const {i18n} = props;
    const [isOpen, setOpen] = React.useState(false);

    return <ButtonDropdown id="issue-tracker-link" isOpen={isOpen} toggle={() => setOpen(!isOpen)}>
        <Button id="issue-tracker-link-toggle" size="sm" color="warning">
            <a href="https://github.com/opendata-mvcr/sgov-assembly-line/issues/new?labels=bug&template=po-adavek-na-opravu.md&title="
               target="_blank" rel="noreferrer">{i18n("main.issue-tracker.reportBug")}</a></Button>
        <DropdownToggle split={true} caret={true} color="warning"/>
        <DropdownMenu>
            <DropdownItem>
                <a href="https://github.com/opendata-mvcr/sgov-assembly-line/issues/new?labels=enhancement&template=po-adavek-na-novou-funkcionalitu.md&title="
                   target="_blank" rel="noreferrer">
                    {i18n("main.issue-tracker.requestFeature")}
                </a>
            </DropdownItem>
        </DropdownMenu>
    </ButtonDropdown>
};

export default injectIntl(withI18n(IssueTrackerLink));
