import * as React from "react";
import {FormGroup, FormText, Label} from "reactstrap";
import Toggle from "react-bootstrap-toggle";
import {useI18n} from "../hook/useI18n";

interface DraftToggleProps {
    id: string; // Toggle id, required by the tooltip component
    draft: boolean // whether the component is in the draft version;
    onToggle: () => void;
}

const DraftToggle: React.FC<DraftToggleProps> = props => {
    const {i18n} = useI18n();
    return <FormGroup>
        <Label id="term-metadata-edit-status"
               className="attribute-label">
            {i18n("term.metadata.status")}
        </Label>
        <br/>
        <Toggle id={props.id}
                onClick={() => props.onToggle()}
                on={i18n("term.metadata.status.confirmed")}
                off={i18n("term.metadata.status.draft")}
                onstyle="primary"
                offstyle="secondary"
                size="sm"
                handleClassName="toggle-handle-custom"
                style={{height: "calc(1.5 * 0.875rem + 0.5rem + 2px)"}}
                active={!props.draft}
                recalculateOnResize={false}/>
        <FormText>{i18n("term.metadata.status.help")}</FormText>
    </FormGroup>;
};

export default DraftToggle;
