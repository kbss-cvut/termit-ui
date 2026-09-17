import File from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import TextAnalysisInvocationButton from "../TextAnalysisInvocationButton";
import Vocabulary from "../../../model/Vocabulary";
import * as Redux from "react-redux";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import * as AsyncActions from "../../../action/AsyncActions";
import {
  renderWithIntl,
  withWebSocket,
} from "../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

// ResourceSelectVocabulary renders a full vocabulary tree select (VocabularySelect), which is not
// under test here. It is stubbed out so these tests can focus on TextAnalysisInvocationButton's own
// wiring of showing the selector and dispatching text analysis on submit.
let lastResourceSelectVocabularyProps: any = null;
vi.mock("../../resource/ResourceSelectVocabulary", () => ({
  default: (props: any) => {
    lastResourceSelectVocabularyProps = props;
    return props.show ? <div data-testid="resource-select-vocabulary" /> : null;
  },
}));

describe("TextAnalysisInvocationButton", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
  const fileName = "test.html";

  let file: File;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    vi.resetAllMocks();
    lastResourceSelectVocabularyProps = null;
    file = new File({
      iri: namespace + fileName,
      label: fileName,
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    vocabulary = Generator.generateVocabulary();
    mockUseI18n();
    const fakeDispatch = vi.fn().mockResolvedValue({});
    (Redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
  });

  it("shows vocabulary selector when button is clicked", async () => {
    const fileIri = VocabularyUtils.create(Generator.generateUri());
    vi.spyOn(AsyncActions, "executeFileTextAnalysis");
    const user = userEvent.setup();
    renderWithIntl(
      withWebSocket(<TextAnalysisInvocationButton fileIri={fileIri} />)
    );
    expect(lastResourceSelectVocabularyProps.show).toBeFalsy();

    await user.click(screen.getByTitle("Start text analysis"));

    expect(lastResourceSelectVocabularyProps.show).toBeTruthy();
    expect(AsyncActions.executeFileTextAnalysis).not.toHaveBeenCalled();
  });

  it("invokes text analysis with selected Vocabulary when Vocabulary selector is submitted", async () => {
    vi.spyOn(AsyncActions, "executeFileTextAnalysis");
    const fileIri = VocabularyUtils.create(file.iri);
    const user = userEvent.setup();
    renderWithIntl(
      withWebSocket(<TextAnalysisInvocationButton fileIri={fileIri} />)
    );

    await user.click(screen.getByTitle("Start text analysis"));
    expect(lastResourceSelectVocabularyProps.show).toBeTruthy();

    lastResourceSelectVocabularyProps.onSubmit(vocabulary);

    expect(AsyncActions.executeFileTextAnalysis).toHaveBeenLastCalledWith(
      fileIri,
      vocabulary.iri
    );
  });
});
