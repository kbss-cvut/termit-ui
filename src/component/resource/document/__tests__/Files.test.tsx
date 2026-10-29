import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import { i18n } from "../../../../__tests__/environment/IntlUtil";
import TermItFile from "../../../../model/File";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Document from "../../../../model/Document";
import Generator from "../../../../__tests__/environment/Generator";
import Files from "../Files";

describe("DocumentFiles", () => {
  let document: Document;

  let actions: JSX.Element[];
  let itemActions: (file: TermItFile) => JSX.Element[];

  beforeEach(() => {
    document = new Document({
      iri: Generator.generateUri(),
      label: "Test document",
      files: [],
      types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE],
    });
    actions = [];
    itemActions = () => [];
  });

  it("renders notice when no Files exist", () => {
    renderWithIntl(
      <Files
        files={document.files}
        actions={actions}
        itemActions={itemActions}
      />
    );
    expect(
      screen.getByText(i18n("resource.metadata.document.files.empty"))
    ).toBeInTheDocument();
  });
});
