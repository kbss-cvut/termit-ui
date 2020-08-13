import * as React from "react";
import Comment, {CommentReaction} from "../../model/Comment";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {FaThumbsDown, FaRegThumbsDown} from "react-icons/fa/index";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import {ThunkDispatch} from "../../util/Types";
import {
    cancelCommentDislike as cancelCommentDislikeAction,
    dislikeComment as dislikeCommentAction
} from "../../action/AsyncCommentActions";
import VocabularyUtils from "../../util/VocabularyUtils";

interface CommentDislikesProps extends HasI18n {
    dislikes: CommentReaction[];
    comment: Comment;

    currentUser: User;
    dislikeComment: (comment: Comment) => Promise<any>;
    cancelCommentDislike: (comment: Comment) => Promise<any>;
}

const CommentDislikes: React.FC<CommentDislikesProps> = props => {
    const {dislikes, currentUser, dislikeComment, cancelCommentDislike, comment} = props;
    const reacted = dislikes.find(cr => cr.author === currentUser.iri) !== undefined;
    const IconElem = reacted ? FaThumbsDown : FaRegThumbsDown;
    const title = reacted ? "comments.comment.dislike.on" : "comments.comment.dislike";
    const onClick = () => {
        reacted ? cancelCommentDislike(comment) : dislikeComment(comment);
    }
    return <div className="ml-2 d-inline-block">
        <IconElem className="reaction" title={props.i18n(title)} onClick={onClick}/>
        &nbsp;
        {dislikes.length}
    </div>;
}

export default connect((state: TermItState) => ({currentUser: state.user}), (dispatch: ThunkDispatch) => {
    return {
        dislikeComment: (comment: Comment) => dispatch(dislikeCommentAction(VocabularyUtils.create(comment.iri!))),
        cancelCommentDislike: (comment: Comment) => dispatch(cancelCommentDislikeAction(VocabularyUtils.create(comment.iri!)))
    };
})(injectIntl(withI18n(CommentDislikes)));
