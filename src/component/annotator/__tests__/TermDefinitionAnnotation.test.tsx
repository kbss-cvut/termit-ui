import Generator from "../../../__tests__/environment/Generator";
import Term from "../../../model/Term";
import { shallow } from "enzyme";
import { TermDefinitionAnnotation } from "../TermDefinitionAnnotation";
import {
  intlFunctions,
  mockUseI18n,
} from "../../../__tests__/environment/IntlUtil";
import SimplePopupWithActions from "../SimplePopupWithActions";
import AnnotationTerms from "../AnnotationTerms";
import TermDefinitionAnnotationView from "../TermDefinitionAnnotationView";
import { withHooks } from "jest-react-hooks-shallow";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("TermDefinitionAnnotation", () => {
  const annotationProps = {
    target: "id_:123",
    resource: Generator.generateUri(),
    text: "Test definition",
  };

  let actions: {
    onRemove: () => void;
    onSelectTerm: (term: Term | null) => void;
    onToggleDetailOpen: () => void;
    onClose: () => void;
  };

  beforeEach(() => {
    actions = {
      onRemove: jest.fn(),
      onSelectTerm: jest.fn(),
      onToggleDetailOpen: jest.fn(),
      onClose: jest.fn(),
    };
    mockUseI18n();
  });

  it("renders term definition view by default", () => {
    const wrapper = shallow(
      <TermDefinitionAnnotation
        isOpen={true}
        term={Generator.generateTerm()}
        {...annotationProps}
        {...actions}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(SimplePopupWithActions).prop("component").type).toEqual(
      TermDefinitionAnnotationView
    );
  });

  it("renders term definition edit when no term is provided", () => {
    const wrapper = shallow(
      <TermDefinitionAnnotation
        isOpen={true}
        term={null}
        {...annotationProps}
        {...actions}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(SimplePopupWithActions).prop("component").type).toEqual(
      AnnotationTerms
    );
  });

  it("switches from editing to view mode when a term is provided", () => {
    withHooks(() => {
      const wrapper = shallow(
        <TermDefinitionAnnotation
          isOpen={true}
          term={null}
          {...annotationProps}
          {...actions}
          {...intlFunctions()}
        />
      );
      expect(
        wrapper.find(SimplePopupWithActions).prop("component").type
      ).toEqual(AnnotationTerms);
      const term = Generator.generateTerm();
      wrapper.setProps({ term });
      wrapper.update();
      expect(
        wrapper.find(SimplePopupWithActions).prop("component").type
      ).toEqual(TermDefinitionAnnotationView);
    });
  });

  it("passes term definition source IRI to onRemove when remove button is clicked", () => {
    let term = Generator.generateTerm();
    term = new Term(
      Object.assign({}, term, {
        definitionSource: {
          iri: Generator.generateUri(),
          term,
          target: {
            source: { iri: Generator.generateUri() },
            types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
          },
          types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
        },
      })
    );
    const wrapper = shallow(
      <TermDefinitionAnnotation
        isOpen={true}
        term={term}
        {...annotationProps}
        {...actions}
        {...intlFunctions()}
      />
    );
    const popup = wrapper.find(SimplePopupWithActions);
    popup.props().actions[1].props.children.props.onClick();
    expect(actions.onRemove).toHaveBeenCalledWith(term.definitionSource!.iri);
  });
});
