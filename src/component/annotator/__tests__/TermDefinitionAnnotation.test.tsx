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
import * as Actions from "../../../action/AsyncTermActions";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

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
      onRemove: jest.fn(),
      onSelectTerm: jest.fn(),
      onToggleDetailOpen: jest.fn(),
      onClose: jest.fn(),
    };
    mockUseI18n();
    fakeDispatch = jest.fn();
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
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

  describe("onRemove", () => {
    it("removes term definition source via action as well as invoking annotation removal", () => {
      const term = Generator.generateTerm();
      jest.spyOn(Actions, "removeTermDefinitionSource");
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

      expect(actions.onRemove).toHaveBeenCalled();
      expect(Actions.removeTermDefinitionSource).toHaveBeenCalledWith(term);
    });
  });
});
