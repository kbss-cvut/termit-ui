import * as React from "react";
import Comment, {CommentReaction} from "../../model/Comment";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {FaRegThumbsUp, FaThumbsUp} from "react-icons/fa";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {ThunkDispatch} from "../../util/Types";
import {
    likeComment as likeCommentAction,
    cancelCommentLike as cancelCommentLikeAction
} from "../../action/AsyncCommentActions";
import VocabularyUtils from "../../util/VocabularyUtils";

interface CommentLikesProps extends HasI18n {
    likes: CommentReaction[];
    comment: Comment;

    currentUser: User;
    likeComment: (comment: Comment) => Promise<any>;
    cancelCommentLike: (comment: Comment) => Promise<any>;
}

const CommentLikes: React.FC<CommentLikesProps> = props => {
    const {likes, currentUser, likeComment, cancelCommentLike, comment} = props;
    const reacted = likes.find(cr => cr.author === currentUser.iri) !== undefined;
    const IconElem = reacted ? FaThumbsUp : FaRegThumbsUp;
    const title = reacted ? "comments.comment.like.on" : "comments.comment.like";
    const onClick = () => {
        reacted ? cancelCommentLike(comment) : likeComment(comment);
    }
    return <div className="ml-2 d-inline-block">
        <IconElem className="reaction" title={props.i18n(title)} onClick={onClick}/>
        &nbsp;
        {likes.length}
    </div>
}

export default connect((state: TermItState) => ({currentUser: state.user}), (dispatch: ThunkDispatch) => {
    return {
        likeComment: (comment: Comment) => dispatch(likeCommentAction(VocabularyUtils.create(comment.iri!))),
        cancelCommentLike: (comment: Comment) => dispatch(cancelCommentLikeAction(VocabularyUtils.create(comment.iri!)))
    };
})(injectIntl(withI18n(CommentLikes)));
