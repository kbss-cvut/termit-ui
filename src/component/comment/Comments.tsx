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
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

interface CommentsProps {
  term: Term;
  onLoad: (commentsCount: number) => void;
  reverseOrder?: boolean;
  allowCreate?: boolean;
}

const Comments: React.FC<CommentsProps> = ({
  term,
  onLoad,
  reverseOrder = false,
  allowCreate = true,
}) => {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const dispatch: ThunkDispatch = useDispatch();

  React.useEffect(() => {
    dispatch(loadTermComments(VocabularyUtils.create(term.iri))).then(
      (data) => {
        setComments(data);
        onLoad(data.length);
      }
    );
  }, [dispatch, setComments, onLoad, term.iri]);
  const termIri = VocabularyUtils.create(term.iri);
  const onSubmit = (comment: Comment) =>
    trackPromise(
      dispatch(createTermComment(comment, termIri)).then(() => {
        dispatch(loadTermComments(termIri)).then((data) => {
          setComments(data);
          onLoad(data.length);
        });
      }),
      "comments"
    );
  const onAddReaction = (comment: Comment, type: string) => {
    trackPromise(
      dispatch(reactToComment(VocabularyUtils.create(comment.iri!), type)).then(
        () =>
          dispatch(loadTermComments(termIri)).then((data) => setComments(data))
      ),
      "comments"
    );
  };
  const onRemoveReaction = (comment: Comment) => {
    trackPromise(
      dispatch(
        removeCommentReaction(VocabularyUtils.create(comment.iri!))
      ).then(() =>
        dispatch(loadTermComments(termIri)).then((data) => setComments(data))
      ),
      "comments"
    );
  };
  const onUpdate = (comment: Comment) => {
    return trackPromise(
      dispatch(updateComment(comment)).then(() =>
        dispatch(loadTermComments(termIri)).then((data) => setComments(data))
      ),
      "comments"
    );
  };
  const onRemove = (comment: Comment) => {
    return trackPromise(
      dispatch(removeComment(comment)).then(() =>
        dispatch(loadTermComments(termIri)).then((data) => {
          setComments(data);
          onLoad(data.length);
        })
      ),
      "comments"
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
      {allowCreate && <CreateCommentForm onSubmit={onSubmit} />}
    </>
  );

  const renderReverse = () => (
    <>
      {allowCreate && <CreateCommentForm onSubmit={onSubmit} />}
      {comments.length > 0 && <hr className="border-top mt-3 mb-1" />}
      <CommentList
        comments={[...comments].reverse()}
        addReaction={onAddReaction}
        removeReaction={onRemoveReaction}
        updateComment={onUpdate}
        removeComment={onRemove}
      />
    </>
  );

  return (
    <div id="term-comments" className="comments m-1 mt-3">
      <PromiseTrackingMask area="comments" />
      {reverseOrder ? renderReverse() : renderForward()}
    </div>
  );
};

export default Comments;
