import * as React from "react";
import Comment from "../../model/Comment";
import CommentView from "./CommentView";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";

interface CommentListProps extends HasI18n {
    comments: Comment[];
    addReaction: (comment: Comment, reactionType: string) => void;
    removeReaction: (comment: Comment) => void;
}

const CommentList: React.FC<CommentListProps> = props => {
    const {comments, addReaction, removeReaction} = props;
    if (comments.length === 0) {
        return <span className="italics">{props.i18n("comments.list.empty")}</span>
    }
    return <>
        {comments.map(c => <CommentView key={c.iri} comment={c} addReaction={addReaction}
                                        removeReaction={removeReaction}/>)}
    </>;
}

export default injectIntl(withI18n(CommentList));
