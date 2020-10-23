import * as React from "react";
import ISO6391 from "iso-639-1";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TERM_MULTILINGUAL_ATTRIBUTES} from "../../model/Term";
import {injectIntl} from "react-intl";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import {FaGlobe} from "react-icons/fa";
import Utils from "../../util/Utils";

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
    return Array.from(languages);
}

const LanguageSelector: React.FC<LanguageSelectorProps> = props => {
    const {term, language, onSelect, i18n} = props;
    if (!term) {
        return null;
    }
    const languages = getLanguages(term);
    if (languages.length <= 1) {
        return null;
    }
    languages.sort();
    return <UncontrolledDropdown id="term-language-selector">
        <DropdownToggle id="term-language-selector-toggle" caret={true} size="sm"
                        title={i18n("term.language.selector")} className="ml-1 mr-0">
            <FaGlobe className="mr-1"/>
            {ISO6391.getNativeName(language)}
        </DropdownToggle>
        <DropdownMenu>
            {languages.map(lang => <DropdownItem key={lang} onClick={() => onSelect(lang)}>
                {ISO6391.getNativeName(lang)}
            </DropdownItem>)}
        </DropdownMenu>
    </UncontrolledDropdown>;
};

export default injectIntl(withI18n(LanguageSelector));
