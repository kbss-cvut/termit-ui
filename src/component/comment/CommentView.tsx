import * as React from "react";
import Comment from "../../model/Comment";
import { FaUserCircle } from "react-icons/fa";
import TimeAgo from "javascript-time-ago";
import Utils from "../../util/Utils";
import CommentLikes from "./CommentLikes";
import CommentDislikes from "./CommentDislikes";
import TermItState from "../../model/TermItState";
import { useSelector } from "react-redux";
import BadgeButton from "../misc/BadgeButton";
import { useI18n } from "../hook/useI18n";
import { IfAuthorized } from "react-authorization";

interface CommentViewProps {
  comment: Comment;
  addReaction: (comment: Comment, reactionType: string) => void;
  removeReaction: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onRemove: (comment: Comment) => void;
}

const CommentView: React.FC<CommentViewProps> = (props) => {
  const { comment, addReaction, removeReaction, onEdit, onRemove } = props;
  const { formatDate, formatTime, i18n, locale } = useI18n();
  const currentUser = useSelector((state: TermItState) => state.user);
  const formatter = new TimeAgo(locale);

  return (
    <div className="comment mt-2 pt-2">
      <div className="avatar float-left">
        <FaUserCircle />
      </div>
      <div className="content">
        <span className="author">{comment.author!.fullName}</span>
        <div className="metadata text-muted">
          <div
            className="d-inline-block mr-2"
            title={`${formatDate(Date.parse(comment.created!))} ${formatTime(
              Date.parse(comment.created!)
            )}`}
          >
            {formatter.format(Date.parse(comment.created!))}
          </div>
          <CommentLikes
            comment={comment}
            reactions={Utils.sanitizeArray(comment.reactions)}
            addReaction={addReaction}
            removeReaction={removeReaction}
          />
          <CommentDislikes
            comment={comment}
            reactions={Utils.sanitizeArray(comment.reactions)}
            addReaction={addReaction}
            removeReaction={removeReaction}
          />
          {comment.modified && (
            <div className="d-inline-block italics ml-3">
              {i18n("comments.comment.edited")}
            </div>
          )}
        </div>
        <div className="comment-text mt-1 mb-2">{comment.content}</div>
        <div className="actions">
          <IfAuthorized
            isAuthorized={() => comment.author!.iri === currentUser.iri}
          >
            <BadgeButton
              className="m-comment-edit"
              color="primary"
              onClick={() => onEdit(comment)}
            >
              {i18n("edit")}
            </BadgeButton>
          </IfAuthorized>
          <IfAuthorized
            isAuthorized={() =>
              comment.author!.iri === currentUser.iri || currentUser.isAdmin()
            }
          >
            <BadgeButton
              className="m-comment-remove"
              color="outline-danger"
              onClick={() => onRemove(comment)}
            >
              {i18n("remove")}
            </BadgeButton>
          </IfAuthorized>
        </div>
      </div>
    </div>
  );
};

export default CommentView;
