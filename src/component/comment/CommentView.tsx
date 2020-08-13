import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Comment from "../../model/Comment";
import {injectIntl} from "react-intl";
import {FaUserCircle, FaRegThumbsUp, FaRegThumbsDown, FaThumbsUp, FaThumbsDown} from "react-icons/fa";
import TimeAgo from "javascript-time-ago";
import Utils from "../../util/Utils";
import CommentReactions from "./CommentReactions";

interface CommentViewProps extends HasI18n {
    comment: Comment;
}

const CommentView: React.FC<CommentViewProps> = props => {
    const {comment, i18n} = props;
    const formatter = new TimeAgo(props.locale);
    return <div className="comment mt-2 pt-2">
        <div className="float-left avatar"><FaUserCircle/></div>
        <div className="content">
            <span className="author">{comment.author!.fullName}</span>
            <div className="metadata text-muted">
                <div className="mr-2 d-inline-block">{formatter.format(comment.created!)}</div>
                <CommentReactions reactions={Utils.sanitizeArray(comment.likes)} iconOn={FaThumbsUp}
                                  iconOff={FaRegThumbsUp} iconOffTitle={i18n("comments.comment.like")}
                                  iconOnTitle={"comments.comment.like.on"}/>
                <CommentReactions reactions={Utils.sanitizeArray(comment.dislikes)} iconOn={FaThumbsDown}
                                  iconOff={FaRegThumbsDown} iconOffTitle={i18n("comments.comment.dislike")}
                                  iconOnTitle={"comments.comment.dislike.on"}/>
            </div>
            <div className="mt-1 mb-2">{comment.content}</div>
        </div>
    </div>;
};

export default injectIntl(withI18n(CommentView));
