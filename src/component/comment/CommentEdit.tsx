import * as React from "react";
import Comment from "../../model/Comment";
import TextArea from "../misc/TextArea";
import { Button, ButtonToolbar } from "reactstrap";
import { FaUserCircle } from "react-icons/fa";
import { useI18n } from "../hook/useI18n";

interface CommentEditProps {
  comment: Comment;
  onSubmit: (comment: Comment) => void;
  onCancel: () => void;
}

const CommentEdit: React.FC<CommentEditProps> = (props) => {
  const { comment, onCancel, onSubmit } = props;
  const { i18n } = useI18n();
  const [content, setContent] = React.useState(comment.content);
  const submit = () => {
    onSubmit(new Comment(Object.assign({}, comment, { content })));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      content.trim().length > 0
    ) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="comment mt-2 pt-2">
      <div className="avatar float-left">
        <FaUserCircle />
      </div>
      <div className="content">
        <TextArea
          value={content}
          autoFocus={true}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <ButtonToolbar className="justify-content-end">
          <Button
            color="success"
            id="comment-edit-submit"
            size="sm"
            disabled={content.trim().length === 0}
            onClick={submit}
          >
            {i18n("save")}
          </Button>
          <Button
            color="outline-dark"
            id="comment-edit-cancel"
            size="sm"
            onClick={onCancel}
          >
            {i18n("cancel")}
          </Button>
        </ButtonToolbar>
      </div>
    </div>
  );
};

export default CommentEdit;
