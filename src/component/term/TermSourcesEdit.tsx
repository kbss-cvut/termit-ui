import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge, Button, FormText, Input, InputGroup, InputGroupAddon, Label} from "reactstrap";
import {GoPlus} from "react-icons/go";
import {FaTrashAlt} from "react-icons/fa";

interface TermSourcesEditProps extends HasI18n {
    sources: string[];
    onChange: (sources: string[]) => void;
}

interface TermSourcesEditState {
    inputValue: string;
}

export class TermSourcesEdit extends React.Component<TermSourcesEditProps, TermSourcesEditState> {
    constructor(props: TermSourcesEditProps) {
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
        const newSources = this.props.sources.slice();
        newSources.push(this.state.inputValue);
        this.props.onChange(newSources);
        this.setState({inputValue: ""});
    };

    private onRemove = (source: string) => {
        const newSources = this.props.sources.slice();
        newSources.splice(newSources.indexOf(source), 1);
        this.props.onChange(newSources);
    };

    public render() {
        const i18n = this.props.i18n;
        return <div>
            <Label className="attribute-label">{i18n("term.metadata.source")}</Label>
            {this.renderSources()}
            <InputGroup className="form-group">
                <Input name="edit-term-add-source-input" value={this.state.inputValue} onChange={this.onChange}
                       bsSize="sm" onKeyPress={this.onKeyPress}
                       placeholder={i18n("term.metadata.source.add.placeholder")}/>
                <InputGroupAddon addonType="append">
                    <Button id="edit-term-add-source-submit" color="primary" size="sm" onClick={this.onAdd}
                            className="term-edit-source-add-button" disabled={this.state.inputValue.trim().length === 0}
                            title={i18n("term.metadata.source.add.placeholder")}><GoPlus/>&nbsp;{i18n("term.metadata.source.add.placeholder.text")}
                    </Button>
                </InputGroupAddon>
            </InputGroup>
            <FormText>{this.props.i18n("term.source.help")}</FormText>
        </div>;
    }

    private renderSources() {
        const sources = this.props.sources;
        if (sources.length === 0) {
            return null;
        }
        return <ul className="term-items">
            {sources.map(s => <li key={s}>
                {s}
                <Badge title={this.props.i18n("term.metadata.source.remove.title")}
                       className="term-edit-source-remove align-middle"
                       onClick={this.onRemove.bind(null, s)}><FaTrashAlt/> {this.props.i18n("term.metadata.source.remove.text")}
                </Badge>
            </li>)}
        </ul>;
    }
}

export default injectIntl(withI18n(TermSourcesEdit));
