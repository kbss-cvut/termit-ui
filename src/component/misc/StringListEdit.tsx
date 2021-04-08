import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import {
  Badge,
  Button,
  FormFeedback,
  FormText,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
} from "reactstrap";
import { GoPlus } from "react-icons/go";
import { FaTrashAlt } from "react-icons/fa";
import Utils from "../../util/Utils";
import "./StringListEdit.scss";

interface StringListEditProps extends HasI18n {
  list?: string[];
  onChange: (list: string[]) => void;
  i18nPrefix: string;
  invalid?: boolean;
  invalidMessage?: JSX.Element;
}

interface StringListEditState {
  inputValue: string;
}

export class StringListEdit extends React.Component<
  StringListEditProps,
  StringListEditState
> {
  constructor(props: StringListEditProps) {
    super(props);
    this.state = {
      inputValue: "",
    };
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.currentTarget.value });
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
    this.setState({ inputValue: "" });
  };

  private onRemove = (item: string) => {
    const newList = Utils.sanitizeArray(this.props.list).slice();
    newList.splice(newList.indexOf(item), 1);
    this.props.onChange(newList);
  };

  private getText = (keySuffix: string) => {
    return this.props.i18n(this.props.i18nPrefix + "." + keySuffix);
  };

  public render() {
    return (
      <div className="form-group">
        <Label className="attribute-label">{this.getText("label")}</Label>
        <InputGroup className="form-group no-bottom-margin">
          <Input
            name="add-string-input"
            value={this.state.inputValue}
            onChange={this.onChange}
            bsSize="sm"
            onKeyPress={this.onKeyPress}
            invalid={this.props.invalid}
            placeholder={this.getText("placeholder")}
          />
          <InputGroupAddon addonType="append">
            <Button
              key="add-string-submit"
              color="primary"
              size="sm"
              onClick={this.onAdd}
              className="input-group-button"
              disabled={this.state.inputValue.trim().length === 0}
              title={this.getText("placeholder.title")}
            >
              <GoPlus />
              &nbsp;{this.getText("placeholder.text")}
            </Button>
          </InputGroupAddon>
          {this.props.invalid ? (
            <FormFeedback>{this.props.invalidMessage}</FormFeedback>
          ) : (
            <></>
          )}
        </InputGroup>
        <FormText>{this.getText("help")}</FormText>
        {this.renderList()}
      </div>
    );
  }

  private renderList() {
    const list = Utils.sanitizeArray(this.props.list);
    if (list.length === 0) {
      return null;
    }
    return (
      <table>
        <tbody>
          {list.map((s) => (
            <tr key={s}>
              <td className="align-middle">
                <ul className="term-items mt-0 mb-0">
                  <li>{s}</li>
                </ul>
              </td>
              <td className="align-middle">
                <Badge
                  title={this.getText("remove.title")}
                  className="list-item-remove-icon align-middle"
                  onClick={this.onRemove.bind(null, s)}
                >
                  <FaTrashAlt /> {this.getText("remove.text")}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default injectIntl(withI18n(StringListEdit));
