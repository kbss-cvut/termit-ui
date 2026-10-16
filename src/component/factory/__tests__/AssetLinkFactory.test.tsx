import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AssetLinkFactory from "../AssetLinkFactory";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";
import Vocabulary from "../../../model/Vocabulary";
import File from "../../../model/File";
import Resource from "../../../model/Resource";
import Generator from "../../../__tests__/environment/Generator";
import { langString } from "../../../model/MultilingualString";
import { screen } from "@testing-library/react";

describe("AssetLinkFactory", () => {
  describe("createAssetLink", () => {
    it("creates TermLink for Term", () => {
      const termName = "test-one";
      const vocabularyName = "metropolitan-plan";
      const vocabularyNamespace = VocabularyUtils.PREFIX;
      const term: Term = new Term({
        iri: vocabularyNamespace + vocabularyName + "/terms/" + termName,
        label: langString("Test one"),
        vocabulary: {
          iri: vocabularyNamespace + vocabularyName,
        },
        types: [VocabularyUtils.TERM],
      });
      renderWithIntl(
        <MemoryRouter>{AssetLinkFactory.createAssetLink(term)}</MemoryRouter>
      );
      expect(
        screen.getByRole("link", { name: "Test one" })
      ).toBeInTheDocument();
    });

    it("creates VocabularyLink for Vocabulary", () => {
      const name = "metropolitan-plan";
      const vocabularyNamespace = VocabularyUtils.PREFIX;
      const vocabulary = new Vocabulary({
        iri: vocabularyNamespace + name,
        label: langString("Vocabulary"),
        types: [VocabularyUtils.VOCABULARY],
      });
      renderWithIntl(
        <MemoryRouter>
          {AssetLinkFactory.createAssetLink(vocabulary)}
        </MemoryRouter>
      );
      expect(
        screen.getByRole("link", { name: "Vocabulary" })
      ).toBeInTheDocument();
    });

    it("creates a plain label for File", () => {
      const name = "mpp-3.3.html";
      const namespace = VocabularyUtils.PREFIX;
      const file = new File({
        iri: namespace + name,
        label: "File",
        types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
      });
      renderWithIntl(
        <MemoryRouter>{AssetLinkFactory.createAssetLink(file)}</MemoryRouter>
      );
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("File")).toBeInTheDocument();
    });

    it("creates a plain label when link cannot be created", () => {
      const resource = new Resource({
        iri: Generator.generateUri(),
        label: "Dataset",
      });
      resource.types = undefined;
      renderWithIntl(
        <MemoryRouter>
          {AssetLinkFactory.createAssetLink(resource)}
        </MemoryRouter>
      );
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("Dataset")).toBeInTheDocument();
    });
  });
});
