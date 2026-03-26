import Generator from "../../../__tests__/environment/Generator";
import Term from "../../../model/Term";
import {shallow} from "enzyme";
import {TermDefinitionAnnotation} from "../TermDefinitionAnnotation";
import {mockUseI18n,} from "../../../__tests__/environment/IntlUtil";
import SimplePopupWithActions from "../SimplePopupWithActions";
import AnnotationTerms from "../AnnotationTerms";
import TermDefinitionAnnotationView from "../TermDefinitionAnnotationView";
import {withHooks} from "vitest-react-hooks-shallow";
import * as Actions from "../../../action/AsyncTermActions";
import * as redux from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import type {Mock} from "vitest";
import AccessLevel from "../../../model/acl/AccessLevel";

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useDispatch: vi.fn(),
    };
});

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

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    actions = {
      onRemove: vi.fn(),
      onSelectTerm: vi.fn(),
      onToggleDetailOpen: vi.fn(),
      onClose: vi.fn(),
    };
    mockUseI18n();
    fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
  });

  it("renders term definition view by default", () => {
    const wrapper = shallow(
      <TermDefinitionAnnotation
        isOpen={true}
        term={Generator.generateTerm()}
        {...annotationProps}
        {...actions}
          accessLevel={AccessLevel.WRITE}
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
        accessLevel={AccessLevel.WRITE}
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
            accessLevel={AccessLevel.WRITE}
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

  describe("onRemove", () => {
    it("removes term definition source via action as well as invoking annotation removal", () => {
      const term = Generator.generateTerm();
      vi.spyOn(Actions, "removeTermDefinitionSource");
      const wrapper = shallow(
        <TermDefinitionAnnotation
          isOpen={true}
          term={term}
          {...annotationProps}
          {...actions}
            accessLevel={AccessLevel.WRITE}
        />
      );
      const popup = wrapper.find(SimplePopupWithActions);
      popup.props().actions[1].props.children.props.onClick();

      expect(actions.onRemove).toHaveBeenCalled();
      expect(Actions.removeTermDefinitionSource).toHaveBeenCalledWith(term);
    });
  });
});
