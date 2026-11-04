import * as React from "react";
import Term, { TermInfo } from "../../../model/Term";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import {
  DefinitionRelatedChanges,
  DefinitionRelatedTermsEdit,
} from "../DefinitionRelatedTermsEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import TermOccurrence from "../../../model/TermOccurrence";
import Constants from "../../../util/Constants";
import { MemoryRouter } from "react-router";
import { RenderResult } from "@testing-library/react";
import {
  flushPromises,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import type { Mock } from "vitest";

vi.mock("../../vocabulary/VocabularyNameBadgeButton", () => ({
  default: () => <span>vocabulary-name</span>,
}));

describe("DefinitionRelatedTermsEdit", () => {
  let term: Term;
  let pending: DefinitionRelatedChanges;
  let onChange: (change: DefinitionRelatedChanges) => void;

  let loadTermByIri: (iri: IRI) => Promise<TermInfo | null>;

  beforeEach(() => {
    term = Generator.generateTerm();
    pending = { pendingApproval: [], pendingRemoval: [] };
    onChange = vi.fn();
    loadTermByIri = vi.fn();
  });

  it("renders only unique terms which occurred in the term's definition", () => {
    const t = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
    ];
    occurrences.forEach((o) =>
      o.types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE)
    );
    (loadTermByIri as Mock).mockResolvedValue(t);
    const { container } = render(occurrences);

    expect(container.querySelectorAll("tbody tr").length).toEqual(1);
  });

  function render(
    occurrences: TermOccurrence[],
    ref: React.RefObject<DefinitionRelatedTermsEdit> = React.createRef()
  ): RenderResult {
    return renderWithIntl(
      <MemoryRouter>
        <DefinitionRelatedTermsEdit
          ref={ref}
          term={term}
          language={Constants.DEFAULT_LANGUAGE}
          loadTermInfoByIri={loadTermByIri}
          pending={pending}
          onChange={onChange}
          definitionRelatedTerms={{
            of: [],
            targeting: occurrences,
          }}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
  }

  it("renders nothing when there are no definitional occurrences targeting current term", () => {
    const { container } = render([]);
    expect(container.firstChild).toBeNull();
  });

  it("renders both suggested and approved occurrences", async () => {
    const t1 = Generator.generateTerm();
    const t2 = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t1),
      Generator.generateOccurrenceOf(t2),
    ];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    (loadTermByIri as Mock).mockResolvedValueOnce(t1).mockResolvedValueOnce(t2);
    const { container } = render(occurrences);

    await act(async () => flushPromises());
    expect(container.querySelectorAll("tbody tr").length).toEqual(
      occurrences.length
    );
  });

  it("renders approved terms before suggested ones", async () => {
    const t1 = Generator.generateTerm();
    const t2 = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t1),
      Generator.generateOccurrenceOf(t2),
    ];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    (loadTermByIri as Mock).mockResolvedValueOnce(t1).mockResolvedValueOnce(t2);
    const { container } = render(occurrences);

    await act(async () => flushPromises());
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toEqual(occurrences.length);
    // Suggested occurrences are rendered in italics, so the first row (approved)
    // must not be italics while the second one (suggested) is
    expect(rows[0].querySelector("td.italics")).toBeNull();
    expect(rows[1].querySelector("td.italics")).not.toBeNull();
  });

  it("does not render terms pending removal", () => {
    const t1 = Generator.generateTerm();
    const occurrences = [Generator.generateOccurrenceOf(t1)];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    pending.pendingRemoval = [occurrences[0]];
    (loadTermByIri as Mock).mockResolvedValueOnce(t1);
    const { container } = render(occurrences);

    expect(container.firstChild).toBeNull();
  });

  describe("onApprove", () => {
    it("adds all occurrences of the same term to pending approvals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as Mock).mockResolvedValue(t);
      const ref = React.createRef<DefinitionRelatedTermsEdit>();
      render(occurrences, ref);

      ref.current!.onApprove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as Mock).mock.calls[0][0].pendingApproval).toEqual(
        occurrences
      );
    });
  });

  describe("onRemove", () => {
    it("adds all occurrences of the same term to pending removals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as Mock).mockResolvedValue(t);
      const ref = React.createRef<DefinitionRelatedTermsEdit>();
      render(occurrences, ref);

      ref.current!.onRemove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as Mock).mock.calls[0][0].pendingRemoval).toEqual(
        occurrences
      );
    });
  });
});
