import * as React from "react";
import { Col, Label, Row, Table } from "reactstrap";
import AssetLinkFactory from "../../../factory/AssetLinkFactory";
import TimeAgo from "javascript-time-ago";
import { AssetBadge } from "./AssetBadge";
import { useSelector } from "react-redux";
import TermItState from "../../../../model/TermItState";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import AssetFactory from "../../../../util/AssetFactory";
import { useI18n } from "../../../hook/useI18n";

export const AssetList: React.FC<{ assets: RecentlyModifiedAsset[] | null }> =
  ({ assets }) => {
    const user = useSelector((state: TermItState) => state.user);
    const { i18n, formatMessage, locale } = useI18n();

    if (!assets) {
      return null;
    }

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
                        title={new Date(
                          Date.parse(asset.modified!)
                        ).toLocaleString(locale)}
                      >
                        {user.iri === asset.editor!.iri
                          ? formatMessage(
                              "dashboard.widget.assetList.lastEditMessageByYou",
                              {
                                when: formatter.format(
                                  Date.parse(asset.modified!)
                                ),
                                operation: asset.editor ? "edit" : "create",
                              }
                            )
                          : formatMessage(
                              "dashboard.widget.assetList.lastEditMessage",
                              {
                                user: asset.editor!.fullName,
                                when: formatter.format(
                                  Date.parse(asset.modified)!
                                ),
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

    return (
      <>
        {assets.length > 0 ? (
          renderNonEmptyContent()
        ) : (
          <div className="italics py-2">
            {i18n("dashboard.widget.assetList.empty")}
          </div>
        )}
      </>
    );
  };

export default AssetList;
