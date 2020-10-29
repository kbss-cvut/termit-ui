import * as React from "react";
import ISO6391 from "iso-639-1";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TERM_MULTILINGUAL_ATTRIBUTES, TermData} from "../../model/Term";
import {injectIntl} from "react-intl";
import {Nav, NavItem, NavLink} from "reactstrap";
import Utils from "../../util/Utils";
import "./LanguageSelector.scss";
import {FaTimesCircle} from "react-icons/fa";

interface LanguageSelectorProps extends HasI18n {
    term: Term | null;
    language: string;
    onSelect: (lang: string) => void;
}

export function getLanguages(term: Term | TermData): string[] {
    const languages: Set<string> = new Set();
    TERM_MULTILINGUAL_ATTRIBUTES.filter(att => term[att]).forEach(att => {
        Utils.sanitizeArray(term[att]).forEach(attValue => Object.getOwnPropertyNames(attValue).forEach(n => languages.add(n)))
    });
    const langArr = Array.from(languages);
    langArr.sort();
    return langArr;
}

export function renderLanguages(languages: string[], selectedLanguage: string, formatMessage: (msgId: string, values: {} | undefined) => string, onSelect: (lang: string) => void, onRemove?: (lang: string) => void) {
    const count = languages.length;
    return languages.map((lang, i) => <NavItem key={lang}
                                               title={formatMessage("term.language.selector.item", {
                                                   lang: ISO6391.getName(lang),
                                                   nativeLang: ISO6391.getNativeName(lang)
                                               })}
                                               active={selectedLanguage === lang}>
        <NavLink onClick={() => onSelect(lang)}
                 className={selectedLanguage === lang ? "active bg-white" : "language-selector-item"}>
            {ISO6391.getNativeName(lang)}
            {count > 1 && onRemove && <FaTimesCircle className="m-remove-lang align-baseline ml-1" onClick={e => {
                e.stopPropagation();
                onSelect(languages[i > 0 ? i - 1 : 1]);
                onRemove(lang);
            }}/>}
        </NavLink>
    </NavItem>);
}

const LanguageSelector: React.FC<LanguageSelectorProps> = props => {
    const {term, language, onSelect, formatMessage} = props;
    if (!term) {
        return null;
    }
    const languages = getLanguages(term);
    if (languages.length <= 1) {
        return null;
    }
    return <div><Nav id="term-language-selector" tabs={true} className="language-selector-nav">
        {renderLanguages(languages, language, formatMessage, onSelect)}
    </Nav></div>;
};

export default injectIntl(withI18n(LanguageSelector));
