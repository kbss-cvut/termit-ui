import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge, Button, FormText, Input, InputGroup, InputGroupAddon, Label} from "reactstrap";
import {GoPlus} from "react-icons/go";
import {FaTrashAlt} from "react-icons/fa";
import "./StringListEdit.scss";
import Utils from "../../util/Utils";

interface StringListEditProps extends HasI18n {
    list?: string[];
    onChange: (list: string[]) => void;
    i18nPrefix: string;
}

interface StringListEditState {
    inputValue: string;
}

export class StringListEdit extends React.Component<StringListEditProps, StringListEditState> {
    constructor(props: StringListEditProps) {
        super(props);
        this.state = {
            inputValue: ""
        };
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({inputValue: e.currentTarget.value});
    };

    private onKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            this.onAdd();
        }
    };

    private onAdd = () => {
        if (this.state.inputValue.length === 0) {
            return;
        }
        const newList = Utils.sanitizeArray(this.props.list).slice();
        newList.push(this.state.inputValue);
        this.props.onChange(newList);
        this.setState({inputValue: ""});
    };

    private onRemove = (item: string) => {
        const newList = Utils.sanitizeArray(this.props.list).slice();
        newList.splice(newList.indexOf(item), 1);
        this.props.onChange(newList);
    };

    private getText = (keySuffix : string) => {
        return this.props.i18n(this.props.i18nPrefix+"."+keySuffix)
    }

    public render() {
        return <div className="form-group-bottom-margin">
            <Label className="attribute-label">{this.getText("label")}</Label>
            <InputGroup className="form-group no-bottom-margin">
                <Input name="add-string-input" value={this.state.inputValue} onChange={this.onChange}
                       bsSize="sm" onKeyPress={this.onKeyPress}
                       placeholder={this.getText("placeholder")}/>
                <InputGroupAddon addonType="append">
                    <Button key="add-string-submit" color="primary" size="sm" onClick={this.onAdd}
                            className="term-edit-source-add-button" disabled={this.state.inputValue.trim().length === 0}
                            title={this.getText("placeholder.title")}><GoPlus/>&nbsp;{this.getText("placeholder.text")}
                    </Button>
                </InputGroupAddon>
            </InputGroup>
            <FormText>{this.getText("help")}</FormText>
            {this.renderList()}
        </div>;
    }

    private renderList() {
        const list = Utils.sanitizeArray(this.props.list);
        if (list.length === 0) {
            return null;
        }
        return <ul className="term-items">
            {list.map(s => <li key={s}>
                {s}
                <Badge title={this.getText("remove.title")}
                       className="term-edit-source-remove align-middle"
                       onClick={this.onRemove.bind(null, s)}><FaTrashAlt/> {this.getText("remove.text")}
                </Badge>
            </li>)}
        </ul>;
    }
}

export default injectIntl(withI18n(StringListEdit));
