import * as React from "react";
import Comment, {CommentReaction, ReactionType} from "../../model/Comment";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {FaRegThumbsUp, FaThumbsUp} from "react-icons/fa";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";

interface CommentLikesProps extends HasI18n {
    reactions: CommentReaction[];
    comment: Comment;

    currentUser: User;
    addReaction: (comment: Comment, reactionType: string) => void;
    removeReaction: (comment: Comment) => void;
}

export function isMine(comment: Comment, user: User) {
    return comment.author!.iri !== user.iri;
}

const CommentLikes: React.FC<CommentLikesProps> = props => {
    const {reactions, currentUser, addReaction, removeReaction, comment} = props;
    const likes = reactions.filter(r => r.types.indexOf(ReactionType.LIKE) !== -1);
    const reacted = likes.find(cr => cr.actor.iri === currentUser.iri) !== undefined;
    const IconElem = reacted ? FaThumbsUp : FaRegThumbsUp;
    const title = reacted ? "comments.comment.like.on" : "comments.comment.like";
    let onClick;
    let iconClass;
    if (isMine(comment, currentUser)) {
        onClick = () => {
            reacted ? removeReaction(comment) : addReaction(comment, ReactionType.LIKE);
        }
        iconClass = "actionable-reaction";
    }
    return <div className="ml-2 d-inline-block">
        <IconElem className={iconClass} title={props.i18n(title)} onClick={onClick}/>
        &nbsp;
        {likes.length}
    </div>
}

export default connect((state: TermItState) => ({currentUser: state.user}))(injectIntl(withI18n(CommentLikes)));
