import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import {
  Button,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
} from "reactstrap";
import { GoPlus } from "react-icons/go";
import { FaTrashAlt } from "react-icons/fa";
import Utils from "../../util/Utils";
import HelpIcon from "./HelpIcon";
import MultilingualIcon from "./MultilingualIcon";
import BadgeButton from "./BadgeButton";
import "./StringListEdit.scss";

interface StringListEditProps extends HasI18n {
  list?: string[];
  multilingual?: boolean;
  onChange: (list: string[]) => void;
  i18nPrefix?: string;
  label?: string;
  helpText?: string;
  invalid?: boolean;
  invalidMessage?: React.ReactNode;
  validationMessage?: string | React.ReactNode;
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

  public render() {
    const { i18n, i18nPrefix, label, helpText } = this.props;
    return (
      <div className="form-group">
        <Label className="attribute-label">
          {label || i18n(`${i18nPrefix}.label`)}
          {this.props.multilingual && (
            <MultilingualIcon
              id={"string-list-edit-multilingual" + Utils.hashCode(i18nPrefix)}
            />
          )}
          {(helpText || i18nPrefix) && (
            <HelpIcon
              id={"string-list-edit-help" + Utils.hashCode(i18nPrefix)}
              text={helpText || i18n(`${i18nPrefix}.help`)}
            />
          )}
        </Label>
        <InputGroup className="form-group mb-0">
          <Input
            name="add-string-input"
            value={this.state.inputValue}
            onChange={(e) => this.setState({ inputValue: e.target.value })}
            bsSize="sm"
            onKeyDown={this.onKeyPress}
            invalid={this.props.invalid}
          />
          <InputGroupAddon addonType="append">
            <Button
              key="add-string-submit"
              color="primary"
              size="sm"
              onClick={this.onAdd}
              className="string-list-add-button"
              disabled={this.state.inputValue.trim().length === 0}
              title={i18n("stringlistedit.button.add.tooltip")}
            >
              <GoPlus />
              &nbsp;{i18n("stringlistedit.button.add")}
            </Button>
          </InputGroupAddon>
          {this.props.invalid && (
            <FormFeedback>{this.props.invalidMessage}</FormFeedback>
          )}
          {this.props.validationMessage && (
            <FormFeedback
              className="validation-feedback"
              title={this.props.i18n("validation.message.tooltip")}
            >
              {this.props.validationMessage}
            </FormFeedback>
          )}
        </InputGroup>
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
                <ul className="mt-0 mb-0">
                  <li>{s}</li>
                </ul>
              </td>
              <td className="align-middle">
                <BadgeButton
                  color="danger"
                  outline={true}
                  title={this.props.i18n(
                    "stringlistedit.button.remove.tooltip"
                  )}
                  className="ml-3"
                  onClick={this.onRemove.bind(null, s)}
                >
                  <FaTrashAlt />{" "}
                  {this.props.i18n("stringlistedit.button.remove")}
                </BadgeButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default injectIntl(withI18n(StringListEdit));
