import {
  UpdateRecord,
  UpdateValueType,
} from "../../../model/changetracking/UpdateRecord";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { UpdateRow } from "../UpdateRow";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import Constants from "../../../util/Constants";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../misc/AssetLabel", () => ({
  default: () => <span>Asset</span>,
}));

describe("UpdateRow", () => {
  function renderUpdateRow(record: UpdateRecord) {
    return renderWithIntl(
      <table>
        <tbody>
          <UpdateRow record={record} onRollback={vi.fn()} />
        </tbody>
      </table>
    );
  }

  it("renders id value as an outgoing link", () => {
    const newValue = Generator.generateUri();
    const record = generateUpdateRecord({ iri: newValue });
    renderUpdateRow(record);
    expect(screen.getByRole("link")).toHaveAttribute("href", newValue);
  });

  it("renders id value as outgoing link and literal as literal in combined value", () => {
    const idValue = Generator.generateUri();
    const literalValue = "117";
    const record = new UpdateRecord({
      iri: Generator.generateUri(),
      timestamp: new Date().toISOString(),
      author: Generator.generateUser(),
      changedEntity: { iri: Generator.generateUri() },
      changedAttribute: { iri: "http://purl.org/dc/terms/source" },
      originalValue: [{ iri: idValue }, literalValue],
      types: [VocabularyUtils.UPDATE_EVENT],
    });
    renderUpdateRow(record);
    expect(screen.getByRole("link")).toHaveAttribute("href", idValue);
    expect(screen.getByText(literalValue)).toBeInTheDocument();
  });

  it("renders lang string value change", () => {
    const newValue = {
      "@language": Constants.DEFAULT_LANGUAGE,
      "@value": "Test value",
    };
    const record = generateUpdateRecord(newValue);
    renderUpdateRow(record);
    expect(screen.getByText(newValue["@value"])).toBeInTheDocument();
    expect(screen.getByText(Constants.DEFAULT_LANGUAGE)).toBeInTheDocument();
  });

  function generateUpdateRecord(newValue: UpdateValueType) {
    return new UpdateRecord({
      iri: Generator.generateUri(),
      timestamp: new Date().toISOString(),
      author: Generator.generateUser(),
      changedEntity: { iri: Generator.generateUri() },
      changedAttribute: { iri: VocabularyUtils.SKOS_PREF_LABEL },
      newValue,
      types: [VocabularyUtils.UPDATE_EVENT],
    });
  }

  it("renders multilingual string value change", () => {
    const newValue = [
      {
        "@language": Constants.DEFAULT_LANGUAGE,
        "@value": "Test value",
      },
      {
        "@language": "cs",
        "@value": "Testovaci hodnota",
      },
    ];
    const record = generateUpdateRecord(newValue);
    renderUpdateRow(record);
    newValue.forEach((nv) => {
      expect(screen.getByText(nv["@value"])).toBeInTheDocument();
      expect(screen.getByText(nv["@language"])).toBeInTheDocument();
    });
  });

  it("handles combination of tagged and language-less values in change", () => {
    const newValue = [
      {
        "@language": Constants.DEFAULT_LANGUAGE,
        "@value": "Test value",
      },
      "test",
    ];
    const record = generateUpdateRecord(newValue);
    renderUpdateRow(record);
    expect(document.querySelectorAll("label")).toHaveLength(newValue.length);
  });
});
