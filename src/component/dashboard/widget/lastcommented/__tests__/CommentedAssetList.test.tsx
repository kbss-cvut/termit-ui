import { renderWithIntl } from "../../../../../__tests__/environment/Environment";
import en from "../../../../../i18n/en";
import Generator from "../../../../../__tests__/environment/Generator";
import { MemoryRouter } from "react-router-dom";
import User from "../../../../../model/User";
import {
  CommentedAssetList,
  DISPLAY_LENGTH_THRESHOLD,
  ELLIPSIS,
} from "../CommentedAssetList";
import Comment from "../../../../../model/Comment";
import VocabularyUtils from "../../../../../util/VocabularyUtils";
import * as Redux from "react-redux";
import { screen } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

describe("CommentedAssetList", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("does not render info message during loading", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <CommentedAssetList assets={null} />
      </MemoryRouter>
    );
    expect(
      screen.queryByText(en.messages["dashboard.widget.commentList.empty"])
    ).not.toBeInTheDocument();
  });

  it("renders info message when no assets were found", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <CommentedAssetList assets={[]} />
      </MemoryRouter>
    );
    expect(
      screen.getByText(en.messages["dashboard.widget.commentList.empty"])
    ).toBeInTheDocument();
  });

  describe("comment content cutting", () => {
    function createComment(content: string) {
      return new Comment({
        iri: Generator.generateUri(),
        created: new Date().toISOString(),
        author: Generator.generateUser(),
        content,
      });
    }

    it("renders substring of the comment text if its length exceeds defined threshold", () => {
      vi.spyOn(Redux, "useSelector").mockReturnValue(user);
      let content = "a";
      while (content.length < DISPLAY_LENGTH_THRESHOLD + 10) {
        content += "a";
      }
      const comment = createComment(content);
      renderWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
          />
        </MemoryRouter>
      );
      const renderedContent = screen.getByTitle(
        en.messages["dashboard.widget.commentList.lastComment"]
      ).textContent!;
      expect(renderedContent.length).toEqual(
        DISPLAY_LENGTH_THRESHOLD + ELLIPSIS.length
      );
    });

    it("renders substring of the comment text until last possible space if its length exceeds defined threshold", () => {
      vi.spyOn(Redux, "useSelector").mockReturnValue(user);
      let content = "auto";
      while (content.length < DISPLAY_LENGTH_THRESHOLD + 10) {
        content += " auto";
      }
      const comment = createComment(content);
      renderWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
          />
        </MemoryRouter>
      );
      const renderedContent = screen.getByTitle(
        en.messages["dashboard.widget.commentList.lastComment"]
      ).textContent!;
      expect(renderedContent.endsWith("auto" + ELLIPSIS)).toBeTruthy();
    });

    it("does not substring comment content when it fits display length threshold", () => {
      vi.spyOn(Redux, "useSelector").mockReturnValue(user);
      const comment = createComment("test comment 12345");
      renderWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: comment,
                iri: Generator.generateUri(),
                label: "Test",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
          />
        </MemoryRouter>
      );
      const renderedContent = screen.getByTitle(
        en.messages["dashboard.widget.commentList.lastComment"]
      ).textContent!;
      expect(renderedContent).toEqual(comment.content);
    });

    it("renders masked label and comment without link to detail when comment view is forbidden", () => {
      vi.spyOn(Redux, "useSelector").mockReturnValue(user);
      const forbiddenComment = createComment("*****");
      const normalComment = createComment("Comment content");
      renderWithIntl(
        <MemoryRouter>
          <CommentedAssetList
            assets={[
              {
                lastComment: forbiddenComment,
                iri: Generator.generateUri(),
                label: "*****",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM, VocabularyUtils.IS_FORBIDDEN],
              },
              {
                lastComment: normalComment,
                iri: Generator.generateUri(),
                label: "Term term",
                vocabulary: { iri: Generator.generateUri() },
                types: [VocabularyUtils.TERM],
              },
            ]}
          />
        </MemoryRouter>
      );
      expect(
        screen.getByRole("link", { name: "Term term" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "*****" })
      ).not.toBeInTheDocument();
    });
  });
});
