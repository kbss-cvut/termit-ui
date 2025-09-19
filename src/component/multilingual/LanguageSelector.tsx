import * as React from "react";
import ISO6391 from "iso-639-1";
import { Nav, NavItem, NavLink } from "reactstrap";
import { FaTimesCircle } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import "./LanguageSelector.scss";

interface LanguageSelectorProps {
  languages: string[];
  language: string;
  requiredLanguage?: string;
  onSelect: (lang: string) => void;
}

export function renderLanguages({
  languages,
  selectedLanguage,
  requiredLanguage,
  formatMessage,
  onSelect,
  onRemove,
}: {
  languages: string[];
  selectedLanguage: string;
  requiredLanguage?: string;
  formatMessage: (msgId: string, values: {} | undefined) => string;
  onSelect: (lang: string) => void;
  onRemove?: (lang: string) => void;
}) {
  const count = languages.length;
  return languages.map((lang, i) => (
    <NavItem
      key={lang}
      title={formatMessage("term.language.selector.item", {
        lang: ISO6391.getName(lang),
        nativeLang: ISO6391.getNativeName(lang),
      })}
      active={selectedLanguage === lang}
    >
      <NavLink
        onClick={() => onSelect(lang)}
        className={
          selectedLanguage === lang
            ? "active bg-white"
            : "language-selector-item"
        }
      >
        {ISO6391.getNativeName(lang)}
        {count > 1 && onRemove && requiredLanguage !== lang && (
          <FaTimesCircle
            className="m-remove-lang ml-1 align-baseline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(languages[i > 0 ? i - 1 : 1]);
              onRemove(lang);
            }}
          />
        )}
      </NavLink>
    </NavItem>
  ));
}

const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  const { language, requiredLanguage, languages, onSelect } = props;
  const { formatMessage } = useI18n();
  if (languages.length <= 1) {
    return null;
  }

  const displayLanguages: string[] = [
    language,
    ...languages.filter((l) => l !== language),
  ];

  return (
    <div>
      <Nav
        id="term-language-selector"
        tabs={true}
        className="language-selector-nav"
      >
        {renderLanguages({
          languages: displayLanguages,
          selectedLanguage: language,
          requiredLanguage,
          formatMessage,
          onSelect,
        })}
      </Nav>
    </div>
  );
};

export default LanguageSelector;
