import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Comment from "../../model/Comment";
import {injectIntl} from "react-intl";
import {FaUserCircle} from "react-icons/fa";
import TimeAgo from "javascript-time-ago";
import Utils from "../../util/Utils";
import CommentLikes from "./CommentLikes";
import CommentDislikes from "./CommentDislikes";
import User from "../../model/User";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";

interface CommentViewProps extends HasI18n {
    comment: Comment;
    addReaction: (comment: Comment, reactionType: string) => void;
    removeReaction: (comment: Comment) => void;
    onEdit: (comment: Comment) => void;

    currentUser: User;
}

const CommentView: React.FC<CommentViewProps> = props => {
    const {comment, addReaction, removeReaction, onEdit, currentUser} = props;
    const formatter = new TimeAgo(props.locale);
    const canEdit = comment.author!.iri === currentUser.iri;
    return <div className="comment mt-2 pt-2">
        <div className="float-left avatar"><FaUserCircle/></div>
        <div className="content">
            <span className="author">{comment.author!.fullName}</span>
            <div className="metadata text-muted">
                <div className="mr-2 d-inline-block">{formatter.format(comment.created!)}</div>
                <CommentLikes comment={comment} reactions={Utils.sanitizeArray(comment.reactions)}
                              addReaction={addReaction} removeReaction={removeReaction}/>
                <CommentDislikes comment={comment} reactions={Utils.sanitizeArray(comment.reactions)}
                                 addReaction={addReaction} removeReaction={removeReaction}/>
                {comment.modified && <div className="ml-3 d-inline-block italics">{props.i18n("comments.comment.edited")}</div>}
            </div>
            <div className="mt-1 mb-2 comment-text">{comment.content}</div>
            <div className="actions">
                {canEdit &&
                <span className="comment-action btn-outline-primary" onClick={() => onEdit(comment)}>{props.i18n("edit")}</span>}
            </div>
        </div>
    </div>;
};

export default connect((state: TermItState) => ({currentUser: state.user}))(injectIntl(withI18n(CommentView)));
