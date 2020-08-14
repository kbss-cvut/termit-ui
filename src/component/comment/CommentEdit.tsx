import * as React from "react";
import Comment from "../../model/Comment";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import TextArea from "../misc/TextArea";

interface CommentEditProps extends HasI18n {
    comment: Comment;
    onSubmit: (comment: Comment) => void;
    onCancel: () => void;
}

const CommentEdit:React.FC<CommentEditProps> = props => {
    const {comment} = props;
    const [content, setContent] = React.useState(comment.content);

    // TODO
    return <TextArea value={content} onChange={e => setContent(e.target.value)}/>;
};

export default injectIntl(withI18n(CommentEdit));
