import * as React from "react";
import ISO6391 from "iso-639-1";
import classNames from "classnames";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Constants from "../../util/Constants";
import { getShortLocale } from "../../util/IntlUtil";
import Term, { TermData } from "../../model/Term";
import { renderLanguages } from "./LanguageSelector";
import { Nav, NavItem, NavLink } from "reactstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import "./LanguageSelector.scss";

interface EditLanguageSelectorProps {
  language: string;
  term: Term | TermData;
  onSelect: (lang: string) => void;
  onRemove: (lang: string) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

function prioritizeLanguages(options: Language[], languages: string[]) {
  languages.forEach((lang) => {
    const ind = options.findIndex((v) => v.code === lang);
    const option = options[ind];
    options.splice(ind, 1);
    options.unshift(option);
  });
  return options;
}

const OPTIONS = prioritizeLanguages(
  ISO6391.getLanguages(ISO6391.getAllCodes()),
  Object.getOwnPropertyNames(Constants.LANG).map((lang) =>
    getShortLocale(Constants.LANG[lang].locale)
  )
);

const EditLanguageSelector: React.FC<EditLanguageSelectorProps> = (props) => {
  const { language, term, onSelect, onRemove } = props;
  const { i18n, formatMessage } = useI18n();
  const [adding, setAdding] = React.useState(false);
  React.useEffect(() => {
    setAdding(false);
  }, [language]);
  const existingLanguages = Term.getLanguages(term);
  if (existingLanguages.indexOf(language) === -1) {
    existingLanguages.push(language);
  }
  const options = OPTIONS.slice();
  for (const existing of existingLanguages) {
    const toRemove = options.findIndex((o) => o.code === existing);
    options.splice(toRemove, 1);
  }

  return (
    <div>
      <Nav
        id="term-edit-language-selector"
        tabs={true}
        className="language-selector-nav"
      >
        {renderLanguages(
          existingLanguages,
          language,
          formatMessage,
          onSelect,
          onRemove
        )}
        <NavItem
          key="add-language"
          className={classNames({ "edit-language-selector": adding })}
        >
          {!adding ? (
            <NavLink
              onClick={() => setAdding(true)}
              className="language-selector-item"
            >
              <FaPlusCircle className="align-baseline" />
            </NavLink>
          ) : (
            <IntelligentTreeSelect
              onChange={(item: Language) => onSelect(item.code)}
              options={options}
              maxHeight={200}
              multi={false}
              labelKey="nativeName"
              valueKey="code"
              classNamePrefix="react-select"
              simpleTreeData={true}
              renderAsTree={false}
              showSettings={false}
              isClearable={false}
              placeholder={i18n("term.language.add.placeholder")}
              noResultsText={i18n("main.search.no-results")}
            />
          )}
        </NavItem>
      </Nav>
    </div>
  );
};

export default EditLanguageSelector;
