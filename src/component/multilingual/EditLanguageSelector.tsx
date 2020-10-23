import * as React from "react";
import {injectIntl} from "react-intl";
import ISO6391 from "iso-639-1";
import withI18n, {HasI18n} from "../hoc/withI18n";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import Constants from "../../util/Constants";
import {getShortLocale} from "../../util/IntlUtil";
import Term from "../../model/Term";
import {getLanguages} from "./LanguageSelector";
import "./EditLanguageSelector.scss";

interface EditLanguageSelectorProps extends HasI18n {
    language: string;
    term: Term;
    onSelect: (lang: string) => void;
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
    const {language, term, onSelect, i18n} = props;
    const existingLanguages = getLanguages(term);
    const options = prioritizeLanguages(OPTIONS.slice(), existingLanguages);
    const value = options.find(o => o.code === language);

    return <div className="d-inline-block edit-language-selector"><IntelligentTreeSelect onChange={(item: Language) => onSelect(item.code)}
                                  value={value}
                                  options={options}
                                  maxHeight={200}
                                  multi={false}
                                  labelKey="nativeName"
                                  valueKey="code"
                                  simpleTreeData={true}
                                  renderAsTree={false}
                                  showSettings={false}
                                  clearable={false}
                                       noResultsText={i18n("main.search.no-results")}/></div>;
};

export default injectIntl(withI18n(EditLanguageSelector));
