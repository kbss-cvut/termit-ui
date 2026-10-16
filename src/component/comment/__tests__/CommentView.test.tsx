import * as Redux from "react-redux";
import User from "../../../model/User";
import Comment from "../../../model/Comment";
import Generator from "../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import CommentView from "../CommentView";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { screen } from "@testing-library/react";
import en from "../../../i18n/en";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

describe("CommentView", () => {
  let user: User;
  let comment: Comment;

  const addReaction: (comment: Comment, reactionType: string) => void = vi.fn();
  const removeReaction: (comment: Comment) => void = vi.fn();
  const onEdit: (comment: Comment) => void = vi.fn();
  const onRemove: (comment: Comment) => void = vi.fn();

  beforeEach(() => {
    user = Generator.generateUser();
    comment = Generator.generateComment();
    comment.created = new Date().toISOString();
    comment.author = user;
  });

  function renderCommentView() {
    return renderWithIntl(
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
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderCommentView();
    expect(
      screen.queryByRole("button", { name: en.messages.edit })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: en.messages.remove })
    ).toBeInTheDocument();
  });

  it("does not display either edit or remove button when current user is not comment author", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    comment.author = Generator.generateUser();
    renderCommentView();
    expect(
      screen.queryByRole("button", { name: en.messages.edit })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: en.messages.remove })
    ).not.toBeInTheDocument();
  });

  it("displays remove button when current user is admin", () => {
    user.types.push(VocabularyUtils.USER_ADMIN);
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    comment.author = Generator.generateUser();
    renderCommentView();
    expect(
      screen.queryByRole("button", { name: en.messages.edit })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: en.messages.remove })
    ).toBeInTheDocument();
  });
});
