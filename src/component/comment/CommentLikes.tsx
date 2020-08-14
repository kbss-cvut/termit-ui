import * as React from "react";
import Comment, {CommentReaction} from "../../model/Comment";
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

const LIKE_TYPE = "https://www.w3.org/ns/activitystreams#Like";

const CommentLikes: React.FC<CommentLikesProps> = props => {
    const {reactions, currentUser, addReaction, removeReaction, comment} = props;
    const likes = reactions.filter(r => r.types.indexOf(LIKE_TYPE) !== -1);
    const reacted = likes.find(cr => cr.actor.iri === currentUser.iri) !== undefined;
    const IconElem = reacted ? FaThumbsUp : FaRegThumbsUp;
    const title = reacted ? "comments.comment.like.on" : "comments.comment.like";
    const onClick = () => {
        reacted ? removeReaction(comment) : addReaction(comment, LIKE_TYPE);
    }
    return <div className="ml-2 d-inline-block">
        <IconElem className="reaction" title={props.i18n(title)} onClick={onClick}/>
        &nbsp;
        {likes.length}
    </div>
}

export default connect((state: TermItState) => ({currentUser: state.user}))(injectIntl(withI18n(CommentLikes)));
