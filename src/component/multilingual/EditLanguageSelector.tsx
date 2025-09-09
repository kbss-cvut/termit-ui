import * as React from "react";
import classNames from "classnames";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { getLanguageOptions, Language } from "../../util/IntlUtil";
import { renderLanguages } from "./LanguageSelector";
import { Nav, NavItem, NavLink } from "reactstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import "./LanguageSelector.scss";

interface EditLanguageSelectorProps {
  language: string;
  existingLanguages: string[];
  requiredLanguage?: string;
  onSelect: (lang: string) => void;
  onRemove: (lang: string) => void;
}

const EditLanguageSelector: React.FC<EditLanguageSelectorProps> = ({
  language,
  existingLanguages,
  requiredLanguage,
  onSelect,
  onRemove,
}) => {
  const { i18n, formatMessage } = useI18n();
  const [adding, setAdding] = React.useState(false);
  React.useEffect(() => {
    setAdding(false);
  }, [language]);
  if (existingLanguages.indexOf(language) === -1) {
    existingLanguages.push(language);
  }
  const options = getLanguageOptions().slice();
  for (const existing of existingLanguages) {
    const toRemove = options.findIndex((o) => o.code === existing);
    options.splice(toRemove, 1);
  }

  return (
    <div>
      <Nav
        id="edit-language-selector"
        tabs={true}
        className="language-selector-nav"
      >
        {renderLanguages({
          languages: existingLanguages,
          selectedLanguage: language,
          requiredLanguage,
          formatMessage,
          onSelect,
          onRemove,
        })}
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
              isClearable={false}
              placeholder={i18n("term.language.add.placeholder")}
              noResultsText={i18n("search.no-results")}
            />
          )}
        </NavItem>
      </Nav>
    </div>
  );
};

export default EditLanguageSelector;
