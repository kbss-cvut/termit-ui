import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../../hoc/withI18n";
import {SearchResultItem} from "../SearchResults";
import FTSMatch from "./../FTSMatch";
import Vocabulary from "../../../../model/Vocabulary";
import VocabularyLink from "../../../vocabulary/VocabularyLink";
import AssetFactory from "../../../../util/AssetFactory";
import VocabularyBadge from "../../../badge/VocabularyBadge";

interface VocabularyResultItemProps extends HasI18n {
    result: SearchResultItem;
}

export class VocabularyResultItem extends React.Component<VocabularyResultItemProps> {

    private getIndexOf(field: string) {
        return this.props.result.snippetFields.indexOf(field);
    }

    public render() {
        const snippets = this.props.result.snippets;
        const text = this.getIndexOf("comment") >= 0 ? snippets[this.getIndexOf("comment")] : "";

        const res = this.props.result;
        return <>
            <VocabularyBadge className="search-result-badge"/>
            <span className="search-result-title">
                <VocabularyLink vocabulary={AssetFactory.createAsset(res) as Vocabulary}/>
            </span><br/>
            <span className="search-result-snippet">
                <FTSMatch match={text || ""}/>
            </span>
        </>;
    }
}

export default injectIntl(withI18n(VocabularyResultItem));
