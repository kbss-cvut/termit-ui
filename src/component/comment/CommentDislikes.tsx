import * as React from "react";
import Comment, {CommentReaction} from "../../model/Comment";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {FaRegThumbsDown, FaThumbsDown} from "react-icons/fa/index";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";

interface CommentDislikesProps extends HasI18n {
    reactions: CommentReaction[];
    comment: Comment;

    currentUser: User;
    addReaction: (comment: Comment, reactionType: string) => void;
    removeReaction: (comment: Comment) => void;
}

const DISLIKE_TYPE = "https://www.w3.org/ns/activitystreams#Dislike";

const CommentDislikes: React.FC<CommentDislikesProps> = props => {
    const {reactions, currentUser, addReaction, removeReaction, comment} = props;
    const dislikes = reactions.filter(r => r.types.indexOf(DISLIKE_TYPE) !== -1);
    const reacted = dislikes.find(cr => cr.actor.iri === currentUser.iri) !== undefined;
    const IconElem = reacted ? FaThumbsDown : FaRegThumbsDown;
    const title = reacted ? "comments.comment.dislike.on" : "comments.comment.dislike";
    const onClick = () => {
        reacted ? removeReaction(comment) : addReaction(comment, DISLIKE_TYPE);
    }
    return <div className="ml-2 d-inline-block">
        <IconElem className="reaction" title={props.i18n(title)} onClick={onClick}/>
        &nbsp;
        {dislikes.length}
    </div>;
}

export default connect((state: TermItState) => ({currentUser: state.user}))(injectIntl(withI18n(CommentDislikes)));
