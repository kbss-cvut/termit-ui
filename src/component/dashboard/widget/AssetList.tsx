import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Col, Label, Row, Table} from "reactstrap";
import AssetLinkFactory from "../../factory/AssetLinkFactory";
import TimeAgo from "javascript-time-ago";
import {injectIntl} from "react-intl";
import {AssetBadge} from "./AssetBadge";
import User from "../../../model/User";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";
import RecentlyModifiedAsset from "../../../model/RecentlyModifiedAsset";
import AssetFactory from "../../../util/AssetFactory";

interface AssetListProps extends HasI18n {
    locale: string;
    user: User;
    assets: RecentlyModifiedAsset[];
    loading: boolean;
}

export class AssetList extends React.Component<AssetListProps> {
    public render() {
        return <>
            {this.props.assets.length > 0 ? this.renderNonEmptyContent() : this.renderEmptyInfo()}
        </>;
    }

    private renderEmptyInfo() {
        return !this.props.loading ?
            <div className="italics py-2">{this.props.i18n("dashboard.widget.assetList.empty")}</div> : null;
    }

    private renderNonEmptyContent() {
        const formatter = new TimeAgo(this.props.locale);
        return <Table className="widget" borderless={true}>
            <tbody>
            {this.props.assets.map(asset => <tr key={asset.iri}>
                <td className="col-xs-12 px-0">
                    <div>
                        <span className="pr-2"><AssetBadge asset={asset}/></span>
                        {AssetLinkFactory.createAssetLink(AssetFactory.createAsset(asset))}
                    </div>
                    <Row>
                        <Col xs={12}>
                            <Label className="italics asset-list-title-message"
                                   title={new Date(asset.modified!).toLocaleString(this.props.locale)}>
                                {(this.props.user.iri === asset.editor!.iri) ?
                                    this.props.formatMessage("dashboard.widget.assetList.lastEditMessageByYou", {
                                        when: formatter.format(asset.modified!),
                                        operation: asset.editor ? "edit" : "create"
                                    }) :
                                    this.props.formatMessage("dashboard.widget.assetList.lastEditMessage", {
                                        user: asset.editor!.fullName,
                                        when: formatter.format(asset.modified!),
                                        operation: asset.editor ? "edit" : "create"
                                    })}
                            </Label>
                        </Col>
                    </Row>
                </td>
            </tr>)}
            </tbody>
        </Table>;
    }
}

export default connect((state: TermItState) => {
    return {
        user: state.user,
    };
})(injectIntl(withI18n(AssetList)));

