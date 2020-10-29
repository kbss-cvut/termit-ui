import * as React from "react";
import {injectIntl} from "react-intl";
import ISO6391 from "iso-639-1";
import classNames from "classnames";
import withI18n, {HasI18n} from "../hoc/withI18n";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import Constants from "../../util/Constants";
import {getShortLocale} from "../../util/IntlUtil";
import Term, {TermData} from "../../model/Term";
import {getLanguages, renderLanguages} from "./LanguageSelector";
import "./LanguageSelector.scss";
import {Nav, NavItem, NavLink} from "reactstrap";
import {FaPlusCircle} from "react-icons/fa";

interface EditLanguageSelectorProps extends HasI18n {
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
    languages.forEach(lang => {
        const ind = options.findIndex(v => v.code === lang);
        const option = options[ind];
        options.splice(ind, 1);
        options.unshift(option);
    });
    return options;
}

const OPTIONS = prioritizeLanguages(ISO6391.getLanguages(ISO6391.getAllCodes()), Object.getOwnPropertyNames(Constants.LANG).map(lang => getShortLocale(Constants.LANG[lang].locale)));

const EditLanguageSelector: React.FC<EditLanguageSelectorProps> = props => {
    const {language, term, onSelect, onRemove, i18n, formatMessage} = props;
    const [adding, setAdding] = React.useState(false);
    React.useEffect(() => {
        setAdding(false);
    }, [language]);
    const existingLanguages = getLanguages(term);
    if (existingLanguages.indexOf(language) === -1) {
        existingLanguages.push(language);
    }
    const options = OPTIONS.slice();
    for (const existing of existingLanguages) {
        const toRemove = options.findIndex(o => o.code === existing);
        options.splice(toRemove, 1);
    }

    return <div><Nav id="term-edit-language-selector" tabs={true} className="language-selector-nav">
        {renderLanguages(existingLanguages, language, formatMessage, onSelect, onRemove)}
        <NavItem key="add-language" className={classNames({"edit-language-selector": adding})}>
            {!adding ?
                <NavLink onClick={() => setAdding(true)} className="language-selector-item"><FaPlusCircle
                    className="align-baseline"/></NavLink> :
                <IntelligentTreeSelect onChange={(item: Language) => onSelect(item.code)}
                                       options={options}
                                       maxHeight={200}
                                       multi={false}
                                       labelKey="nativeName"
                                       valueKey="code"
                                       simpleTreeData={true}
                                       renderAsTree={false}
                                       showSettings={false}
                                       clearable={false}
                                       placeholder={i18n("term.language.add.placeholder")}
                                       noResultsText={i18n("main.search.no-results")}/>}
        </NavItem>
    </Nav></div>;
};

export default injectIntl(withI18n(EditLanguageSelector));
