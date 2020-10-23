import * as React from "react";
import ISO6391 from "iso-639-1";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TERM_MULTILINGUAL_ATTRIBUTES} from "../../model/Term";
import {injectIntl} from "react-intl";
import {Nav, NavItem, NavLink} from "reactstrap";
import Utils from "../../util/Utils";
import "./LanguageSelector.scss";

interface LanguageSelectorProps extends HasI18n {
    term: Term | null;
    language: string;
    onSelect: (lang: string) => void;
}

export function getLanguages(term: Term): string[] {
    const languages: Set<string> = new Set();
    TERM_MULTILINGUAL_ATTRIBUTES.filter(att => term[att]).forEach(att => {
        Utils.sanitizeArray(term[att]).forEach(attValue => Object.getOwnPropertyNames(attValue).forEach(n => languages.add(n)))
    });
    const langArr = Array.from(languages);
    langArr.sort();
    return langArr;
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
        {languages.map(lang => <NavItem key={lang}
                                        title={formatMessage("term.language.selector.item", {
                                            lang: ISO6391.getName(lang),
                                            nativeLang: ISO6391.getNativeName(lang)
                                        })}
                                        active={language === lang}>
            <NavLink onClick={() => onSelect(lang)} className={language === lang ? "active bg-white" : "language-selector-item"}>
                {ISO6391.getNativeName(lang)}
            </NavLink>
        </NavItem>)}
    </Nav></div>;
};

export default injectIntl(withI18n(LanguageSelector));
