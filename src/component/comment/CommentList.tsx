import * as React from "react";
import Comment from "../../model/Comment";
import CommentView from "./CommentView";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { injectIntl } from "react-intl";
import CommentEdit from "./CommentEdit";

interface CommentListProps extends HasI18n {
  comments: Comment[];
  addReaction: (comment: Comment, reactionType: string) => void;
  removeReaction: (comment: Comment) => void;
  updateComment: (comment: Comment) => Promise<void>;
  removeComment: (comment: Comment) => Promise<void>;
}

const CommentList: React.FC<CommentListProps> = (props) => {
  const {
    comments,
    addReaction,
    removeReaction,
    updateComment,
    removeComment,
  } = props;

  const [editedComment, setEditedComment] =
    React.useState<Comment | null>(null);
  if (comments.length === 0) {
    return <span className="italics">{props.i18n("comments.list.empty")}</span>;
  }
  const onUpdate = (c: Comment) => {
    updateComment(c).then(() => setEditedComment(null));
  };
  return (
    <>
      {comments.map((c) =>
        editedComment != null && c.iri === editedComment.iri ? (
          <CommentEdit
            key={c.iri}
            comment={c}
            onCancel={() => setEditedComment(null)}
            onSubmit={onUpdate}
          />
        ) : (
          <CommentView
            key={c.iri}
            comment={c}
            addReaction={addReaction}
            removeReaction={removeReaction}
            onEdit={setEditedComment}
            onRemove={removeComment}
          />
        )
      )}
    </>
  );
};

export default injectIntl(withI18n(CommentList));
