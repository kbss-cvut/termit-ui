import * as React from "react";
import {Label} from "reactstrap";
import {InputType} from "reactstrap/lib/Input";
import classNames from "classnames";
import HelpIcon from "./HelpIcon";

export interface AbstractInputProps {
    name?: string;
    label?: string;
    labelClass?: string;
    placeholder?: string;
    title?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    help?: string;
    valid?: boolean;
    invalid?: boolean;
    invalidMessage?: string | JSX.Element;
    autoFocus?: boolean;
    autoComplete?: string;
    type?: InputType;
    disabled?: boolean;
    readOnly?: boolean;
}

export default class AbstractInput<T extends AbstractInputProps> extends React.Component<T> {

    protected renderLabel() {
        return this.props.label ?
            <Label
                className={classNames("attribute-label", this.props.labelClass)}>{this.props.label}{this.renderHelp()}</Label> : null;
    }

    private renderHelp() {
        return this.props.help ? <HelpIcon id={this.props.name!} text={this.props.help!}/> : null;
    }

    protected inputProps() {
        const {invalidMessage, help, labelClass, ...p} = this.props as AbstractInputProps;
        return p;
    }
}
