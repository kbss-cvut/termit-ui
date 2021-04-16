import * as React from "react";
import { useCallback } from "react";
import { Table } from "reactstrap";
import TimeAgo from "javascript-time-ago";
import User from "../../../../model/User";
import { connect } from "react-redux";
import TermItState from "../../../../model/TermItState";
import TermIriLink from "../../../term/TermIriLink";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import { useI18n } from "../../../hook/useI18n";
import "./CommentedAssetList.scss";
import Comment from "../../../../model/Comment";

export const DISPLAY_LENGTH_THRESHOLD = 65;
export const ELLIPSIS = "...";

interface CommentedAssetListProps {
  user: User;
  assets: RecentlyCommentedAsset[];
  loading: boolean;
}

function renderCommentText(text: string) {
  if (text.length <= DISPLAY_LENGTH_THRESHOLD) {
    return text;
  }
  const spaceIndex = text.lastIndexOf(" ", DISPLAY_LENGTH_THRESHOLD);
  return (
    text.substring(0, spaceIndex > 0 ? spaceIndex : DISPLAY_LENGTH_THRESHOLD) +
    ELLIPSIS
  );
}

export const CommentedAssetList: React.FC<CommentedAssetListProps> = (
  props
) => {
  const { assets, loading, user } = props;
  const { i18n, formatMessage, locale } = useI18n();

  const renderEmptyInfo = () =>
    !loading ? (
      <div className="italics py-2">
        {i18n("dashboard.widget.commentList.empty")}
      </div>
    ) : null;

  const renderMessage = useCallback(
    (lastEdited: number, author: User) => {
      const formatter = new TimeAgo(locale);
      return user.iri === author.iri
        ? formatMessage("dashboard.widget.commentList.messageByYou", {
            when: formatter.format(lastEdited),
          })
        : formatMessage("dashboard.widget.commentList.message", {
            user: author.fullName,
            when: formatter.format(lastEdited),
          });
    },
    [formatMessage, user, locale]
  );

  const renderComment = useCallback(
    (comment: Comment) => {
      const lastEdited = comment.modified ? comment.modified : comment.created;
      return (
        <>
          <div
            className="comment-text"
            title={i18n("dashboard.widget.commentList.lastComment")}
          >
            {renderCommentText(comment.content)}
          </div>
          <div
            className="italics asset-list-title-message"
            title={new Date(lastEdited!).toLocaleString(locale)}
          >
            {renderMessage(lastEdited!, new User(comment.author!))}
          </div>
        </>
      );
    },
    [renderMessage, i18n, locale]
  );

  const renderCommentedAsset = useCallback(
    (commentedAsset: RecentlyCommentedAsset) => {
      return (
        <td className="col-xs-12 px-0">
          <div>
            <TermIriLink iri={commentedAsset.iri!} />
            <br />
            {commentedAsset.myLastComment ? (
              <>
                {renderComment(commentedAsset.myLastComment)}
                <div className="ml-4">
                  <span className="text-muted">
                    {i18n("dashboard.widget.commentList.myLastComment")}
                  </span>
                  {renderComment(commentedAsset.lastComment)}
                </div>
              </>
            ) : (
              renderComment(commentedAsset.lastComment)
            )}
          </div>
        </td>
      );
    },
    [renderMessage, i18n, locale]
  );

  const renderNonEmptyContent = () => {
    return (
      <Table className="widget w-100" borderless={true}>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.iri}>{renderCommentedAsset(asset)}</tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return <>{assets.length > 0 ? renderNonEmptyContent() : renderEmptyInfo()}</>;
};

export default connect((state: TermItState) => ({ user: state.user }))(
  CommentedAssetList
);
