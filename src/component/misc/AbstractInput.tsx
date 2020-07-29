import * as React from "react";
import {Label, FormText} from "reactstrap";
import {InputType} from "reactstrap/lib/Input";

export interface AbstractInputProps {
    name?: string;
    label?: string;
    placeholder?: string;
    title?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    help?: string;
    valid?: boolean;
    invalid?: boolean;
    invalidMessage?: string;
    autoFocus?: boolean;
    autoComplete?: string;
    type?: InputType;
    disabled?: boolean;
}

export default class AbstractInput<T extends AbstractInputProps> extends React.Component<T> {

    protected renderLabel() {
        return this.props.label ? <Label className="attribute-label">{this.props.label}</Label> : null;
    }

    protected renderHelp() {
        return this.props.help ? <FormText>{this.props.help}</FormText> : null;
    }

    protected inputProps() {
        const {invalidMessage, help, ...p} = this.props as AbstractInputProps;
        return p;
    }
}
