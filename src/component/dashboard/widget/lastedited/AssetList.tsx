import * as React from "react";
import { Col, Label, Row, Table } from "reactstrap";
import AssetLinkFactory from "../../../factory/AssetLinkFactory";
import TimeAgo from "javascript-time-ago";
import { AssetBadge } from "./AssetBadge";
import User from "../../../../model/User";
import { connect } from "react-redux";
import TermItState from "../../../../model/TermItState";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import AssetFactory from "../../../../util/AssetFactory";
import { useI18n } from "../../../hook/useI18n";

interface AssetListProps {
  user: User;
  assets: RecentlyModifiedAsset[];
  loading: boolean;
}

export const AssetList: React.FC<AssetListProps> = (props) => {
  const { assets, loading, user } = props;
  const { i18n, formatMessage, locale } = useI18n();

  const renderEmptyInfo = () =>
    !loading ? (
      <div className="italics py-2">
        {i18n("dashboard.widget.assetList.empty")}
      </div>
    ) : null;

  const renderNonEmptyContent = () => {
    const formatter = new TimeAgo(locale);
    return (
      <Table className="widget" borderless={true}>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.iri}>
              <td className="col-xs-12 px-0">
                <div>
                  <span className="pr-2">
                    <AssetBadge asset={asset} />
                  </span>
                  {AssetLinkFactory.createAssetLink(
                    AssetFactory.createAsset(asset)
                  )}
                </div>
                <Row>
                  <Col xs={12}>
                    <Label
                      className="italics asset-list-title-message"
                      title={new Date(asset.modified!).toLocaleString(locale)}
                    >
                      {user.iri === asset.editor!.iri
                        ? formatMessage(
                            "dashboard.widget.assetList.lastEditMessageByYou",
                            {
                              when: formatter.format(asset.modified!),
                              operation: asset.editor ? "edit" : "create",
                            }
                          )
                        : formatMessage(
                            "dashboard.widget.assetList.lastEditMessage",
                            {
                              user: asset.editor!.fullName,
                              when: formatter.format(asset.modified!),
                              operation: asset.editor ? "edit" : "create",
                            }
                          )}
                    </Label>
                  </Col>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return <>{assets.length > 0 ? renderNonEmptyContent() : renderEmptyInfo()}</>;
};

export default connect((state: TermItState) => ({ user: state.user }))(
  AssetList
);
