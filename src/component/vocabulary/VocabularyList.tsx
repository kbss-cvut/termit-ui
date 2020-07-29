import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import Utils from "../../util/Utils";

interface VocabularyListProps extends HasI18n {
    onSelect: (voc: Vocabulary) => void;

    vocabularies: { [id: string]: Vocabulary };
    selectedVocabulary: Vocabulary;
    loading: boolean;
}

export const VocabularyList: React.FC<VocabularyListProps> = props => {
    const options = Object.keys(props.vocabularies).map((v) => {
        const voc = props.vocabularies[v];
        return {
            iri: voc.iri,
            label: voc.label,
            comment: voc.comment ? voc.comment : voc.label,
            types: Utils.sanitizeArray(voc.types).slice(),
            children: []
        }
    });
    if (options.length === 0 && !props.loading) {
        return <div className="italics">{props.i18n("vocabulary.management.empty")}</div>;
    }
    const height = Utils.calculateAssetListHeight();
    const i18n = props.i18n;
    return <div id="vocabulary-list">
        <IntelligentTreeSelect className="p-0"
                               onChange={props.onSelect}
                               options={options}
                               valueKey="iri"
                               labelKey="label"
                               isMenuOpen={true}
                               multi={false}
                               showSettings={false}
                               displayInfoOnHover={true}
                               scrollMenuIntoView={false}
                               renderAsTree={false}
                               maxHeight={height}
                               valueRenderer={Utils.labelValueRenderer}
                               noResultsText={i18n("main.search.no-results")}
                               placeholder={i18n("vocabulary.vocabularies.select.placeholder")}
                               tooltipKey="comment"
        />
    </div>;
};

export default connect((state: TermItState) => {
    return {
        vocabularies: state.vocabularies,
        selectedVocabulary: state.vocabulary,
        loading: state.loading
    };
})(injectIntl(withI18n(VocabularyList)));
