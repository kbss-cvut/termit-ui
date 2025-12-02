import * as React from "react";
import ISO6391 from "iso-639-1";
import { Nav, NavItem, NavLink } from "reactstrap";
import { FaTimesCircle } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";
import "./LanguageSelector.scss";

interface LanguageSelectorProps {
  languages: string[];
  language: string;
  primaryLanguage?: string;
  onSelect: (lang: string) => void;
}

export function renderLanguages({
  languages,
  selectedLanguage,
  formatMessage,
  onSelect,
}: {
  languages: string[];
  selectedLanguage: string;
  formatMessage: (msgId: string, values: {} | undefined) => string;
  onSelect: (lang: string) => void;
}) {
  return languages.map((lang, i) =>
    renderLanguageItem({
      lang,
      index: i,
      languages,
      selectedLanguage,
      formatMessage,
      onSelect,
      removable: false,
    })
  );
}

export function renderRemovableLanguages({
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
  onRemove: (lang: string) => void;
}) {
  return languages.map((lang, i) =>
    renderLanguageItem({
      lang,
      index: i,
      languages,
      selectedLanguage,
      requiredLanguage,
      formatMessage,
      onSelect,
      onRemove,
      removable: true,
    })
  );
}

function renderLanguageItem({
  lang,
  index,
  languages,
  selectedLanguage,
  requiredLanguage,
  formatMessage,
  onSelect,
  onRemove,
  removable,
}: {
  lang: string;
  index: number;
  languages: string[];
  selectedLanguage: string;
  requiredLanguage?: string;
  formatMessage: (msgId: string, values: {} | undefined) => string;
  onSelect: (lang: string) => void;
  onRemove?: (lang: string) => void;
  removable: boolean;
}) {
  const count = languages.length;
  const showRemove = removable && count > 1 && requiredLanguage !== lang;
  return (
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
        {showRemove && (
          <FaTimesCircle
            className="m-remove-lang ml-1 align-baseline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(languages[index > 0 ? index - 1 : 1]);
              onRemove?.(lang);
            }}
          />
        )}
      </NavLink>
    </NavItem>
  );
}

const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  const { language, primaryLanguage, languages, onSelect } = props;
  const { formatMessage } = useI18n();
  if (languages.length <= 1) {
    return null;
  }

  const displayLanguages: string[] = primaryLanguage
    ? [primaryLanguage, ...languages.filter((l) => l !== primaryLanguage)]
    : languages;

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
          formatMessage,
          onSelect,
        })}
      </Nav>
    </div>
  );
};

export default LanguageSelector;
