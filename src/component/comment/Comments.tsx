import * as React from "react";
import Term from "../../model/Term";
import VocabularyUtils from "../../util/VocabularyUtils";
import Comment from "../../model/Comment";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  createTermComment,
  loadTermComments,
  reactToComment,
  removeComment,
  removeCommentReaction,
  updateComment,
} from "../../action/AsyncCommentActions";
import CreateCommentForm from "./CreateCommentForm";
import CommentList from "./CommentList";
import "./Comments.scss";

interface CommentsProps {
  term: Term;
  onLoad: (commentsCount: number) => void;
  reverseOrder: boolean;
}

const Comments: React.FC<CommentsProps> = (props) => {
  const { term, onLoad } = props;
  const [comments, setComments] = React.useState<Comment[]>([]);
  const dispatch: ThunkDispatch = useDispatch();

  React.useEffect(() => {
    dispatch(loadTermComments(VocabularyUtils.create(term.iri))).then(
      (data) => {
        setComments(data);
        onLoad(data.length);
      }
    );
  }, [setComments, onLoad, term.iri]);
  const termIri = VocabularyUtils.create(term.iri);
  const onSubmit = (comment: Comment) =>
    dispatch(createTermComment(comment, termIri)).then(() => {
      dispatch(loadTermComments(termIri)).then((data) => {
        setComments(data);
        onLoad(data.length);
      });
    });
  const onAddReaction = (comment: Comment, type: string) => {
    dispatch(reactToComment(VocabularyUtils.create(comment.iri!), type)).then(
      () =>
        dispatch(loadTermComments(termIri)).then((data) => setComments(data))
    );
  };
  const onRemoveReaction = (comment: Comment) => {
    dispatch(removeCommentReaction(VocabularyUtils.create(comment.iri!))).then(
      () =>
        dispatch(loadTermComments(termIri)).then((data) => setComments(data))
    );
  };
  const onUpdate = (comment: Comment) => {
    return dispatch(updateComment(comment)).then(() =>
      dispatch(loadTermComments(termIri)).then((data) => setComments(data))
    );
  };
  const onRemove = (comment: Comment) => {
    return dispatch(removeComment(comment)).then(() =>
      dispatch(loadTermComments(termIri)).then((data) => {
        setComments(data);
        onLoad(data.length);
      })
    );
  };

  const renderForward = () => (
    <>
      <CommentList
        comments={comments}
        addReaction={onAddReaction}
        removeReaction={onRemoveReaction}
        updateComment={onUpdate}
        removeComment={onRemove}
      />
      {comments.length > 0 && <hr className="border-top mt-3 mb-1" />}
      <CreateCommentForm onSubmit={onSubmit} />
    </>
  );

  const renderReverse = () => (
    <>
      <CreateCommentForm onSubmit={onSubmit} />
      {comments.length > 0 && <hr className="border-top mt-3 mb-1" />}
      <CommentList
        comments={comments.reverse()}
        addReaction={onAddReaction}
        removeReaction={onRemoveReaction}
        updateComment={onUpdate}
        removeComment={onRemove}
      />
    </>
  );

  return (
    <div id="term-comments" className="comments m-1 mt-3">
      {props.reverseOrder ? renderReverse() : renderForward()}
    </div>
  );
};

export default Comments;
