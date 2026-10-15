import User from "../../../model/User";
import Generator from "../../../__tests__/environment/Generator";
import IfUserIsEditor from "../IfUserIsEditor";
import * as redux from "react-redux";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import { Mock, vi } from "vitest";
import en from "../../../i18n/en";

const unauthorizedMessage = en.messages["unauthorized.message"];

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("IfUserIsEditor", () => {
  let currentUser: User;

  beforeEach(() => {
    currentUser = Generator.generateUser();
    (redux.useSelector as Mock).mockReturnValue(currentUser);
  });

  it("renders children components when current user is not restricted", () => {
    currentUser.types.push(VocabularyUtils.USER_EDITOR);
    renderWithIntl(
      <IfUserIsEditor>
        <div>Test</div>
      </IfUserIsEditor>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.queryByText(unauthorizedMessage)).not.toBeInTheDocument();
  });

  it("renders unauthorized component when current user is restricted", () => {
    currentUser.types.push(VocabularyUtils.USER_RESTRICTED);
    renderWithIntl(
      <IfUserIsEditor renderUnauthorizedAlert={true}>
        <div>Test</div>
      </IfUserIsEditor>
    );
    expect(screen.queryByText("Test")).not.toBeInTheDocument();
    expect(screen.getByText(unauthorizedMessage)).toBeInTheDocument();
  });

  it("renders nothing when user is restricted and renderUnauthorizedAlert is false", () => {
    currentUser.types.push(VocabularyUtils.USER_RESTRICTED);
    const { container } = renderWithIntl(
      <IfUserIsEditor renderUnauthorizedAlert={false}>
        <div>Test</div>
      </IfUserIsEditor>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
