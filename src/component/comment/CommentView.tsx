import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Comment from "../../model/Comment";
import {injectIntl} from "react-intl";
import {GoPerson} from "react-icons/go";
import TimeAgo from "javascript-time-ago";

interface CommentViewProps extends HasI18n {
    comment: Comment;
}

const CommentView: React.FC<CommentViewProps> = props => {
    const {comment} = props;
    const formatter = new TimeAgo(props.locale);
    return <div className="comment mt-2 pt-2">
        <div className="float-left avatar"><GoPerson/></div>
        <div className="content">
            <span className="author">{comment.author!.fullName}</span>
            <div className="metadata text-muted">{formatter.format(comment.created!)}</div>
            <div className="mt-1 mb-2">{comment.content}</div>
        </div>
    </div>;
};

export default injectIntl(withI18n(CommentView));
