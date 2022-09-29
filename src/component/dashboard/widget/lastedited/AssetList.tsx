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
import { FaRegBell } from "react-icons/fa";

export const AssetList: React.FC<{ assets: RecentlyModifiedAsset[] | null }> =
  ({ assets }) => {
    const user = useSelector((state: TermItState) => state.user);
    const lastSeen = user.lastSeen ? Date.parse(user.lastSeen) : Date.now();
    const { i18n, formatMessage, locale } = useI18n();

    if (!assets) {
      return null;
    }

    const renderNonEmptyContent = () => {
      const formatter = new TimeAgo(locale);
      return (
        <Table className="widget" borderless={true}>
          <tbody>
            {assets.map((asset) => {
              const modifiedTimestamp = Date.parse(asset.modified!);
              return (
                <tr key={asset.iri}>
                  <td className="col-xs-12 px-0">
                    <div>
                      {lastSeen < modifiedTimestamp && (
                        <FaRegBell
                          className="mr-1"
                          title={i18n("dashboard.widget.assetList.new.tooltip")}
                        />
                      )}
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
                          title={new Date(modifiedTimestamp).toLocaleString(
                            locale
                          )}
                        >
                          {user.iri === asset.editor!.iri
                            ? formatMessage(
                                "dashboard.widget.assetList.lastEditMessageByYou",
                                {
                                  when: formatter.format(modifiedTimestamp),
                                  operation: asset.editor ? "edit" : "create",
                                }
                              )
                            : formatMessage(
                                "dashboard.widget.assetList.lastEditMessage",
                                {
                                  user: asset.editor!.fullName,
                                  when: formatter.format(modifiedTimestamp),
                                  operation: asset.editor ? "edit" : "create",
                                }
                              )}
                        </Label>
                      </Col>
                    </Row>
                  </td>
                </tr>
              );
            })}
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
