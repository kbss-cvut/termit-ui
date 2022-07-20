import React from "react";
import Term from "../../model/Term";
import TermOccurrence from "../../model/TermOccurrence";
import { connect } from "react-redux";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";
import { useI18n } from "../hook/useI18n";
import { ButtonToolbar, Col, Row, Table } from "reactstrap";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { injectIntl } from "react-intl";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { ThunkDispatch } from "../../util/Types";
import { loadTermByIri } from "../../action/AsyncActions";
import TermLink from "./TermLink";
import classNames from "classnames";
import Utils from "../../util/Utils";
import InfoIcon from "../misc/InfoIcon";
import BadgeButton from "../misc/BadgeButton";

interface DefinitionRelatedTermsEditProps extends HasI18n {
  term: Term;
  language: string;
  pending: DefinitionRelatedChanges;
  onChange: (change: DefinitionRelatedChanges) => void;

  definitionRelatedTerms: DefinitionallyRelatedTerms;
  loadTermByIri: (iri: IRI) => Promise<Term | null>;
}

export interface DefinitionRelatedChanges {
  pendingApproval: TermOccurrence[];
  pendingRemoval: TermOccurrence[];
}

interface DefinitionRelatedTermsEditState {
  termCache: { [key: string]: Term };
}

function findWithCommonTerm(
  occurrences: TermOccurrence[],
  getter: (o: TermOccurrence) => string,
  termIri: string
) {
  return occurrences.filter((o) => getter(o) === termIri);
}

/**
 * Reduces the specified term occurrences to only those with a unique term identifier (provided by the specified getter).
 * @param occurrences Occurrences to reduce
 * @param getter Getter of the term identifier to reduce by
 */
export function reduceToUnique(
  occurrences: TermOccurrence[],
  getter: (o: TermOccurrence) => string
) {
  const unique = {};
  return occurrences.filter((o) => {
    const iri = getter(o);
    if (unique[iri]) {
      return false;
    }
    unique[iri] = true;
    return true;
  });
}

export class DefinitionRelatedTermsEdit extends React.Component<
  DefinitionRelatedTermsEditProps,
  DefinitionRelatedTermsEditState
> {
  constructor(props: DefinitionRelatedTermsEditProps) {
    super(props);
    this.state = {
      termCache: {},
    };
  }

  public componentDidMount() {
    const irisToLoad: Set<string> = new Set<string>();
    this.props.definitionRelatedTerms.targeting.forEach((to) =>
      irisToLoad.add(to.term.iri!)
    );
    this.props.definitionRelatedTerms.of.forEach((to) =>
      irisToLoad.add(to.target.source.iri!)
    );
    irisToLoad.forEach((iri) => {
      this.props.loadTermByIri(VocabularyUtils.create(iri)).then((t) => {
        const toAdd = {};
        toAdd[iri] = t;
        this.setState({
          termCache: Object.assign({}, this.state.termCache, toAdd),
        });
      });
    });
  }

  public onApprove = (to: TermOccurrence) => {
    this.handleOccurrence(to, (occurrences) => {
      const approved = [...this.props.pending.pendingApproval, ...occurrences];
      this.props.onChange({
        pendingApproval: approved,
        pendingRemoval: this.props.pending.pendingRemoval,
      });
    });
  };

  /**
   * Handle all occurrences of the same/targeting the same term at once.
   *
   * Individual occurrence handling may be reintroduced in the future when have a way of displaying all the individual occurrences separately.
   */
  private handleOccurrence(
    occurrence: TermOccurrence,
    handler: (occurrences: TermOccurrence[]) => void
  ) {
    const ofCurrentTerm = this.isOfCurrentTerm(occurrence);
    const relatedTerms = this.props.definitionRelatedTerms;
    const toHandle = findWithCommonTerm(
      ofCurrentTerm ? relatedTerms.of : relatedTerms.targeting,
      ofCurrentTerm ? (o) => o.target.source.iri! : (o) => o.term.iri!,
      ofCurrentTerm ? occurrence.target.source.iri! : occurrence.term.iri!
    );
    handler(toHandle);
  }

  private isOfCurrentTerm(occurrence: TermOccurrence): boolean {
    return occurrence.term.iri === this.props.term.iri;
  }

  public onRemove = (to: TermOccurrence) => {
    const pending = this.props.pending;
    this.handleOccurrence(to, (occurrences) =>
      this.props.onChange({
        pendingRemoval: [...pending.pendingRemoval, ...occurrences],
        pendingApproval: pending.pendingApproval.filter(
          (to) => occurrences.indexOf(to) === -1
        ),
      })
    );
  };

  private canApprove(to: TermOccurrence) {
    const pending = this.props.pending;
    return (
      to.isSuggested() &&
      pending.pendingApproval.indexOf(to) === -1 &&
      pending.pendingRemoval.indexOf(to) === -1
    );
  }

  private canRemove(to: TermOccurrence) {
    return this.props.pending.pendingRemoval.indexOf(to) === -1;
  }

  private isSuggested(to: TermOccurrence) {
    return (
      to.isSuggested() && this.props.pending.pendingApproval.indexOf(to) === -1
    );
  }

  private prioritizeApproved(occurrences: TermOccurrence[]) {
    occurrences.sort((a, b) => {
      const aS = this.isSuggested(a);
      const bS = this.isSuggested(b);
      return aS && bS ? a.iri!.localeCompare(b.iri!) : aS ? 1 : -1;
    });
  }

  public render() {
    const { language, i18n, definitionRelatedTerms, pending } = this.props;
    const { termCache } = this.state;
    const targeting = reduceToUnique(
      definitionRelatedTerms.targeting,
      (o) => o.term.iri!
    ).filter((to) => pending.pendingRemoval.indexOf(to) === -1);
    this.prioritizeApproved(targeting);
    if (targeting.length === 0) {
      return null;
    }
    return (
      <Row className="mt-2">
        <Col className="mx-3">
          <Row>
            <Col>
              <>
                <h5>
                  {i18n("term.metadata.related.definitionally.targeting")}
                </h5>
                <Table responsive={true} borderless={true}>
                  <tbody>
                    {targeting.map((to) => (
                      <tr key={to.iri}>
                        <DefinitionalTermOccurrence
                          key={to.term.iri}
                          term={termCache[to.term.iri!]}
                          occurrence={to}
                          language={language}
                          onApprove={this.onApprove}
                          onRemove={this.onRemove}
                          canApprove={this.canApprove(to)}
                          canRemove={this.canRemove(to)}
                          isSuggested={this.isSuggested(to)}
                        />
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

interface DefinitionalTermOccurrenceProps {
  occurrence: TermOccurrence;
  term: Term;
  language: string;
  onApprove: (to: TermOccurrence) => void;
  onRemove: (to: TermOccurrence) => void;
  canApprove: boolean;
  canRemove: boolean;
  isSuggested: boolean;
}

export const DefinitionalTermOccurrence: React.FC<DefinitionalTermOccurrenceProps> =
  (props) => {
    const {
      occurrence,
      term,
      language,
      onApprove,
      onRemove,
      canApprove,
      canRemove,
      isSuggested,
    } = props;
    const { i18n } = useI18n();
    return (
      <>
        <td
          className={classNames("pl-0 align-middle", {
            italics: isSuggested,
          })}
        >
          {isSuggested && (
            <InfoIcon
              className="mr-1"
              text={i18n("term.metadata.related.definitionally.suggested")}
              id={`term-metadata-definition-suggested-${Utils.hashCode(
                occurrence.iri!
              )}`}
            />
          )}
          {term && <TermLink term={term} language={language} />}
        </td>
        <td className="pr-0">
          <ButtonToolbar className="d-inline pull-right ml-1">
            {canApprove && (
              <BadgeButton
                color="primary"
                size="sm"
                title={i18n("annotation.confirm")}
                onClick={() => onApprove(occurrence)}
              >
                <FaCheck className="mr-1" />
                {i18n("approve")}
              </BadgeButton>
            )}
            {canRemove && (
              <BadgeButton
                color="danger"
                size="sm"
                outline={true}
                title={i18n("annotation.remove")}
                onClick={() => onRemove(occurrence)}
              >
                <FaTrashAlt className="mr-1" />
                {i18n("remove")}
              </BadgeButton>
            )}
          </ButtonToolbar>
        </td>
      </>
    );
  };

export default connect(
  (state: TermItState) => ({
    definitionRelatedTerms: state.definitionallyRelatedTerms,
  }),
  (dispatch: ThunkDispatch) => {
    return {
      loadTermByIri: (iri: IRI) => dispatch(loadTermByIri(iri)),
    };
  }
)(injectIntl(withI18n(DefinitionRelatedTermsEdit)));
