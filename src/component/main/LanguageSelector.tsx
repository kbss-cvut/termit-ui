import * as React from "react";
import Constants, { Language } from "../../util/Constants";
import "./LanguageSelector.scss";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { switchLanguage } from "../../action/SyncActions";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import classNames from "classnames";
import { useI18n } from "../hook/useI18n";

const LanguageSelector: React.FC<{
  fixed: boolean;
  authenticated: boolean;
}> = ({ fixed, authenticated }) => {
  const { i18n } = useI18n();
  const language = useSelector((state: TermItState) => state.intl.locale);
  const dispatch = useDispatch();

  const onSelect = (lang: Language) => {
    if (language === lang.locale) {
      return;
    }
    dispatch(switchLanguage(lang));
  };

  const selectedLanguage = Object.values(Constants.LANG).find(
    (p) => p.locale === language
  )!;

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
        title={i18n("main.lang-selector.tooltip")}
      >
        <img
          src={selectedLanguage.flag}
          className="flag"
          alt={selectedLanguage.label}
        />
        &nbsp;
        <span className="d-none d-sm-block">
          &nbsp;{selectedLanguage.label}
        </span>
      </DropdownToggle>
      <DropdownMenu right={true}>
        {Object.values(Constants.LANG).map((lang) => (
          <DropdownItem
            key={lang.isoCode[0]}
            name={`language-selector.${lang.isoCode[0]}`}
            onClick={() => onSelect(lang)}
          >
            <img src={lang.flag} className="flag" alt={lang.label} />
            &nbsp;&nbsp;{lang.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default LanguageSelector;
