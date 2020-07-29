import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../../hoc/withI18n";
import AssetLink from "../../../misc/AssetLink";
import Term from "../../../../model/Term";
import {SearchResultItem} from "../SearchResults";
import AssetLabel from "../../../misc/AssetLabel";
import AssetFactory from "../../../../util/AssetFactory";
import FTSMatch from "./../FTSMatch";
import TermBadge from "../../../badge/TermBadge";
import {getTermPath} from "../../../term/TermLink";
import {EMPTY_USER} from "../../../../model/User";

interface TermResultItemProps extends HasI18n {
    result: SearchResultItem;
}

export class TermResultItem extends React.Component<TermResultItemProps> {


    private getIndexOf(field: string) {
        return this.props.result.snippetFields.indexOf(field);
    }

    public render() {
        const i18n = this.props.i18n;
        const t = {
            iri: this.props.result.iri,
            label: <><span className="search-result-title">{this.props.result.label}</span>&nbsp;
                {this.props.result.vocabulary ? <>
                    {i18n("search.results.vocabulary.from")}&nbsp;
                    <AssetLabel iri={this.props.result.vocabulary!.iri}/>
                </> : <></>}</>
        }

        let text;
        if (this.getIndexOf("definition") > -1) {
            text = this.props.result.snippets[this.getIndexOf("definition")]
        } else {
            text = "";
        }

        const asset = AssetFactory.createAsset(this.props.result);
        return <>
            <TermBadge className="search-result-badge"/>
            <AssetLink
                asset={t}
                path={getTermPath(asset as Term, EMPTY_USER)}
                tooltip={i18n("asset.link.tooltip")}/><br/>
            <span className="search-result-snippet">{this.getIndexOf("definition") > -1 ?
                <FTSMatch match={text || ""}/> : text
            }</span>
        </>;
    }
}

export default injectIntl(withI18n(TermResultItem));
