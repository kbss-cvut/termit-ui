import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { DefinitionRelatedTerms } from "../DefinitionRelatedTerms";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import TermIriLink from "../TermIriLink";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AppNotification from "../../../model/AppNotification";
import ActionType from "../../../action/ActionType";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import NotificationType from "../../../model/NotificationType";
import { langString } from "../../../model/MultilingualString";

describe("DefinitionRelatedTerms", () => {
  let term: Term;

  let loadDefinitionRelatedTermsTargeting: (term: Term) => Promise<any>;
  let loadDefinitionRelatedTermsOf: (term: Term) => Promise<any>;
  let consumeNotification: (n: AppNotification) => void;

  beforeEach(() => {
    term = Generator.generateTerm(Generator.generateUri());
    loadDefinitionRelatedTermsTargeting = jest.fn().mockResolvedValue([]);
    loadDefinitionRelatedTermsOf = jest.fn().mockResolvedValue([]);
    consumeNotification = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function render(
    relatedTerms: DefinitionallyRelatedTerms,
    notificiations: AppNotification[] = []
  ) {
    return shallow<DefinitionRelatedTerms>(
      <DefinitionRelatedTerms
        term={term}
        relatedTerms={relatedTerms}
        notifications={notificiations}
        loadDefinitionRelatedTermsTargeting={
          loadDefinitionRelatedTermsTargeting
        }
        loadDefinitionRelatedTermsOf={loadDefinitionRelatedTermsOf}
        consumeNotification={consumeNotification}
        {...intlFunctions()}
      />
    );
  }

  it("renders only unique terms in whose definition term occurred", () => {
    const occurrences = [
      Generator.generateOccurrenceOf(term),
      Generator.generateOccurrenceOf(term),
      Generator.generateOccurrenceOf(term),
    ];
    const t = Generator.generateTerm();
    occurrences.forEach((o) => (o.target.source = { iri: t.iri }));
    (loadDefinitionRelatedTermsOf as jest.Mock).mockResolvedValue(occurrences);
    const wrapper = render({ targeting: [], of: occurrences });
    expect(wrapper.find(TermIriLink).length).toEqual(1);
  });

  it("renders only unique terms which occurred in the term's definition", () => {
    const t = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
    ];
    (loadDefinitionRelatedTermsTargeting as jest.Mock).mockResolvedValue(
      occurrences
    );
    const wrapper = render({ targeting: occurrences, of: [] });
    expect(wrapper.find(TermIriLink).length).toEqual(1);
  });

  it("renders approved occurrences before suggested ones", () => {
    const occurrences = [
      Generator.generateOccurrenceOf(Generator.generateTerm()),
      Generator.generateOccurrenceOf(Generator.generateTerm()),
    ];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    (loadDefinitionRelatedTermsOf as jest.Mock).mockResolvedValue(occurrences);
    const wrapper = render({ targeting: occurrences, of: [] });
    const links = wrapper.find(TermIriLink);
    expect(links.get(0).props.iri).toEqual(occurrences[1].term.iri);
    expect(links.get(1).props.iri).toEqual(occurrences[0].term.iri);
  });

  it("schedules reloading of related terms when new term was created", () => {
    render({ targeting: [], of: [] }, [
      {
        source: {
          type: ActionType.CREATE_VOCABULARY_TERM,
          status: AsyncActionStatus.SUCCESS,
        },
      },
    ]);
    expect(setTimeout).toHaveBeenCalled();
  });

  it("cancels reload timer on unmount when it has not been invoked yet", () => {
    const wrapper = render({ targeting: [], of: [] }, [
      {
        source: {
          type: ActionType.CREATE_VOCABULARY_TERM,
          status: AsyncActionStatus.SUCCESS,
        },
      },
    ]);
    expect(setTimeout).toHaveBeenCalled();
    wrapper.unmount();
    expect(clearTimeout).toHaveBeenCalled();
  });

  it("reloads related terms on timer when term's label had changed", () => {
    const term = Generator.generateTerm();
    const notification = {
      source: { type: NotificationType.ASSET_UPDATED },
      original: term,
      updated: new Term(
        Object.assign({}, term, { label: langString("Updated label") })
      ),
    };

    const wrapper = render({ targeting: [], of: [] }, [notification]);
    wrapper.setProps({ notifications: [] });
    wrapper.update();
    jest.runOnlyPendingTimers();
    expect(loadDefinitionRelatedTermsOf).toHaveBeenCalledTimes(2);
    expect(loadDefinitionRelatedTermsTargeting).toHaveBeenCalledTimes(2);
  });

  it("consumes the notification which caused related terms reloading on timer when timer expires", () => {
    // This ensures the notification is consumed by someone if it has not been consumed already by another component
    const term = Generator.generateTerm();
    const notification = {
      source: { type: NotificationType.ASSET_UPDATED },
      original: term,
      updated: new Term(
        Object.assign({}, term, { label: langString("Updated label") })
      ),
    };

    const wrapper = render({ targeting: [], of: [] }, [notification]);
    (consumeNotification as jest.Mock).mockImplementation(() => {
      wrapper.setProps({ notifications: [] });
      wrapper.update();
    });
    jest.runOnlyPendingTimers();
    expect(consumeNotification).toHaveBeenCalledWith(notification);
  });
});
