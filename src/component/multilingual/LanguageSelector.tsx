import * as React from "react";
import ISO6391 from "iso-639-1";
import Term from "../../model/Term";
import {Nav, NavItem, NavLink} from "reactstrap";
import "./LanguageSelector.scss";
import {FaTimesCircle} from "react-icons/fa";
import {useI18n} from "../hook/useI18n";

interface LanguageSelectorProps {
    term: Term | null;
    language: string;
    onSelect: (lang: string) => void;
}

export function renderLanguages(
    languages: string[],
    selectedLanguage: string,
    formatMessage: (msgId: string, values: {} | undefined) => string,
    onSelect: (lang: string) => void,
    onRemove?: (lang: string) => void
) {
    const count = languages.length;
    return languages.map((lang, i) => (
        <NavItem
            key={lang}
            title={formatMessage("term.language.selector.item", {
                lang: ISO6391.getName(lang),
                nativeLang: ISO6391.getNativeName(lang)
            })}
            active={selectedLanguage === lang}
        >
            <NavLink
                onClick={() => onSelect(lang)}
                className={selectedLanguage === lang ? "active bg-white" : "language-selector-item"}
            >
                {ISO6391.getNativeName(lang)}
                {count > 1 && onRemove && (
                    <FaTimesCircle
                        className="m-remove-lang align-baseline ml-1"
                        onClick={e => {
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

const LanguageSelector: React.FC<LanguageSelectorProps> = props => {
    const {term, language, onSelect} = props;
    const {formatMessage} = useI18n();
    if (!term) {
        return null;
    }
    const languages = Term.getLanguages(term);
    if (languages.length <= 1) {
        return null;
    }
    return (
        <div>
            <Nav id="term-language-selector" tabs={true} className="language-selector-nav">
                {renderLanguages(languages, language, formatMessage, onSelect)}
            </Nav>
        </div>
    );
};

export default LanguageSelector;
