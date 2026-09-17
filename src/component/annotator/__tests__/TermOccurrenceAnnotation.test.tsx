import Term from "../../../model/Term";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import { TermOccurrenceAnnotation } from "../TermOccurrenceAnnotation";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import {
  AnnotationClass,
  AnnotationOrigin,
} from "../../../model/AnnotatorLegendFilter";
import Generator from "../../../__tests__/environment/Generator";
import AccessLevel from "../../../model/acl/AccessLevel";
import { MemoryRouter } from "react-router";

describe("TermOccurrenceAnnotation", () => {
  const text = "mesta";
  const suggestedOccProps = {
    about: "_:-421713841",
    property: "ddo:je-vyskytem-termu",
    typeof: "ddo:vyskyt-termu",
    target: "test",
    text,
  };

  let actions: {
    onRemove: () => void;
    onSelectTerm: (term: Term | null) => void;
    onToggleDetailOpen: () => void;
    onCreateTerm: () => void;
    onClose: () => void;
  };

  beforeEach(() => {
    actions = {
      onRemove: vi.fn(),
      onSelectTerm: vi.fn(),
      onToggleDetailOpen: vi.fn(),
      onCreateTerm: vi.fn(),
      onClose: vi.fn(),
    };
    mockUseI18n();
    const target = document.createElement("span");
    target.id = "test";
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.getElementById("test")?.remove();
  });

  it("does not render confirm button for suggested occurrence of an unknown term", () => {
    renderWithIntl(
      <MemoryRouter>
        <TermOccurrenceAnnotation
          {...actions}
          {...suggestedOccProps}
          annotationClass={AnnotationClass.SUGGESTED_OCCURRENCE}
          annotationOrigin={AnnotationOrigin.PROPOSED}
          isOpen={true}
          accessLevel={AccessLevel.WRITE}
        />
      </MemoryRouter>
    );
    expect(
      screen.queryByTitle("Confirm suggestion of term occurrence")
    ).not.toBeInTheDocument();
  });

  it("switches from editing to view mode when a term is provided", () => {
    const { rerender } = renderWithIntl(
      <MemoryRouter>
        <TermOccurrenceAnnotation
          {...actions}
          {...suggestedOccProps}
          annotationClass={AnnotationClass.SUGGESTED_OCCURRENCE}
          annotationOrigin={AnnotationOrigin.PROPOSED}
          isOpen={true}
          accessLevel={AccessLevel.WRITE}
        />
      </MemoryRouter>
    );
    const term = Generator.generateTerm();
    rerender(
      <MemoryRouter>
        <TermOccurrenceAnnotation
          {...actions}
          {...suggestedOccProps}
          term={term}
          annotationClass={AnnotationClass.SUGGESTED_OCCURRENCE}
          annotationOrigin={AnnotationOrigin.PROPOSED}
          isOpen={true}
          accessLevel={AccessLevel.WRITE}
        />
      </MemoryRouter>
    );
    expect(screen.getByTitle("Edit term occurrence")).toBeInTheDocument();
  });
});
