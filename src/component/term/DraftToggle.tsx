import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {FormGroup, FormText, Label} from "reactstrap";
import Toggle from "react-bootstrap-toggle";

interface DraftToggleProps extends HasI18n {
    id: string; // Toggle id, required by the tooltip component
    draft: boolean // whether the component is in the draft version;
    onToggle: () => void;
}

const DraftToggle: React.FC<DraftToggleProps> = props =>
    <FormGroup>
        <Label id="term-metadata-edit-status"
               className="attribute-label">
            {props.i18n("term.metadata.status")}
        </Label>
        <br/>
        <Toggle id={props.id}
                onClick={() => props.onToggle()}
                on={props.i18n("term.metadata.status.confirmed")}
                off={props.i18n("term.metadata.status.draft")}
                onstyle="primary"
                offstyle="secondary"
                size="sm"
                handleClassName="toggle-handle-custom"
                style={{height: "calc(1.5 * 0.875rem + 0.5rem + 2px)"}}
                active={!props.draft}
                recalculateOnResize={false}/>
        <FormText>{props.i18n("term.metadata.status.help")}</FormText>
    </FormGroup>;

export default injectIntl(withI18n(DraftToggle));
