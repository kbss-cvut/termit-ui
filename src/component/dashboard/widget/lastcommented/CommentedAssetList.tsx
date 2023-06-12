import * as React from "react";
import { useCallback } from "react";
import { Table } from "reactstrap";
import TimeAgo from "javascript-time-ago";
import User from "../../../../model/User";
import { useSelector } from "react-redux";
import TermItState from "../../../../model/TermItState";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import { useI18n } from "../../../hook/useI18n";
import "./CommentedAssetList.scss";
import Comment from "../../../../model/Comment";
import { FaRegBell } from "react-icons/fa";
import TermLink from "../../../term/TermLink";
import { langString } from "../../../../model/MultilingualString";
import VocabularyUtils from "../../../../util/VocabularyUtils";

export const DISPLAY_LENGTH_THRESHOLD = 65;
export const ELLIPSIS = "...";

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

function shouldHighlight(
  lastSeen: number,
  userUri: string,
  item: RecentlyCommentedAsset
) {
  const modified = Date.parse(
    item.lastComment.modified
      ? item.lastComment.modified
      : item.lastComment.created!
  );
  return lastSeen < modified && userUri !== item.lastComment.author?.iri;
}

function renderLink(
  item: RecentlyCommentedAsset,
  i18n: (messageId: string) => string
) {
  if (item.types.indexOf(VocabularyUtils.IS_FORBIDDEN) !== -1) {
    return <span title={i18n("auth.view.unauthorized")}>{item.label}</span>;
  }
  return (
    <TermLink
      term={{
        iri: item.iri,
        label: langString(item.label),
        vocabulary: item.vocabulary,
      }}
      activeTab="comments.title"
    />
  );
}

export const CommentedAssetList: React.FC<{
  assets: RecentlyCommentedAsset[] | null;
}> = ({ assets }) => {
  const user = useSelector((state: TermItState) => state.user);
  const lastSeen = user.lastSeen ? Date.parse(user.lastSeen) : Date.now();
  const { i18n, formatMessage, locale } = useI18n();

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
      const lastEdited = Date.parse(
        comment.modified ? comment.modified : comment.created!
      );
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
            title={new Date(lastEdited).toLocaleString(locale)}
          >
            {renderMessage(lastEdited, new User(comment.author!))}
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
            {shouldHighlight(lastSeen, user.iri, commentedAsset) && (
              <FaRegBell
                className="asset-list-highlight-icon mr-1"
                title={i18n("dashboard.widget.assetList.new.tooltip")}
              />
            )}
            {renderLink(commentedAsset, i18n)}
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
    [renderComment, i18n, lastSeen, user.iri]
  );

  const renderNonEmptyContent = () => {
    return (
      <Table className="widget w-100" borderless={true}>
        <tbody>
          {assets!.map((asset) => (
            <tr key={asset.iri}>{renderCommentedAsset(asset)}</tr>
          ))}
        </tbody>
      </Table>
    );
  };
  if (assets === null) {
    return null;
  }

  return (
    <>
      {assets.length > 0 ? (
        renderNonEmptyContent()
      ) : (
        <div className="italics py-2">
          {i18n("dashboard.widget.commentList.empty")}
        </div>
      )}
    </>
  );
};

export default CommentedAssetList;
