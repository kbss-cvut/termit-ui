import * as Redux from "react-redux";
import User from "../../../model/User";
import Comment from "../../../model/Comment";
import Generator from "../../../__tests__/environment/Generator";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import CommentView from "../CommentView";
import VocabularyUtils from "../../../util/VocabularyUtils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("CommentView", () => {
  let user: User;
  let comment: Comment;

  const addReaction: (comment: Comment, reactionType: string) => void =
    jest.fn();
  const removeReaction: (comment: Comment) => void = jest.fn();
  const onEdit: (comment: Comment) => void = jest.fn();
  const onRemove: (comment: Comment) => void = jest.fn();

  beforeEach(() => {
    user = Generator.generateUser();
    comment = Generator.generateComment();
    comment.created = new Date().toISOString();
    comment.author = user;
  });

  function render() {
    return mountWithIntl(
      <CommentView
        comment={comment}
        addReaction={addReaction}
        removeReaction={removeReaction}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    );
  }

  it("displays edit and remove button when current user is comment author", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = render();
    expect(wrapper.exists("button.m-comment-edit")).toBeTruthy();
    expect(wrapper.exists("button.m-comment-remove")).toBeTruthy();
  });

  it("does not display either edit or remove button when current user is not comment author", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    comment.author = Generator.generateUser();
    const wrapper = render();
    expect(wrapper.exists("button.m-comment-edit")).toBeFalsy();
    expect(wrapper.exists("button.m-comment-remove")).toBeFalsy();
  });

  it("displays remove button when current user is admin", () => {
    user.types.push(VocabularyUtils.USER_ADMIN);
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    comment.author = Generator.generateUser();
    const wrapper = render();
    expect(wrapper.exists("button.m-comment-edit")).toBeFalsy();
    expect(wrapper.exists("button.m-comment-remove")).toBeTruthy();
  });
});
