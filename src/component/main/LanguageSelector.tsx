import * as React from "react";
import Constants from "../../util/Constants";
import "./LanguageSelector.scss";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { switchLanguage } from "../../action/SyncActions";
import { ThunkDispatch } from "../../util/Types";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import classNames from "classnames";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";

interface LanguageSelectorProps extends HasI18n {
  language: string;
  fixed: boolean;
  authenticated: boolean;
  switchLanguage: (lang: string) => void;
}

export class LanguageSelector extends React.Component<LanguageSelectorProps> {
  public onSelect = (lang: string) => {
    if (this.props.language === lang) {
      return;
    }
    this.props.switchLanguage(lang);
  };

  private resolveSelectedLanguage(): React.ReactFragment {
    const selected = Object.getOwnPropertyNames(Constants.LANG).find(
      (p) => Constants.LANG[p].locale === this.props.language
    );
    const lang = Constants.LANG[selected!];

    return (
      <React.Fragment>
        <img src={lang.flag} className="flag" alt={lang.label} />
        &nbsp;
        <span className="d-none d-sm-block">&nbsp;{lang.label}</span>
      </React.Fragment>
    );
  }

  public render() {
    const { authenticated, fixed } = this.props;

    return (
      <UncontrolledDropdown
        className={classNames({
          "p-3": !authenticated,
        })}
      >
        <DropdownToggle
          name="language-selector"
          className={classNames(
            "d-flex",
            "align-items-center",
            "language-selector",
            {
              "language-selector-fixed": fixed,
              "language-selector-public": !authenticated,
            }
          )}
          caret={true}
          nav={authenticated}
          title={this.props.i18n("main.lang-selector.tooltip")}
        >
          {this.resolveSelectedLanguage()}
        </DropdownToggle>
        <DropdownMenu right={true}>
          <DropdownItem
            name="language-selector.cs"
            onClick={this.onSelect.bind(null, Constants.LANG.CS.locale)}
          >
            <img
              src={Constants.LANG.CS.flag}
              className="flag"
              alt={Constants.LANG.CS.label}
            />
            &nbsp;&nbsp;{Constants.LANG.CS.label}
          </DropdownItem>
          <DropdownItem divider={true} />

          <DropdownItem
            nane="language-selector.en"
            onClick={this.onSelect.bind(null, Constants.LANG.EN.locale)}
          >
            <img
              src={Constants.LANG.EN.flag}
              className="flag"
              alt={Constants.LANG.EN.label}
            />
            &nbsp;&nbsp;{Constants.LANG.EN.label}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      language: state.intl.locale,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      switchLanguage: (lang: string) => dispatch(switchLanguage(lang)),
    };
  }
)(injectIntl(withI18n(LanguageSelector)));
