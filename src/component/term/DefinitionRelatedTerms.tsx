import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term from "../../model/Term";
import { Alert, Col, Label, Row, Table } from "reactstrap";
import InfoIcon from "../misc/InfoIcon";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  loadDefinitionRelatedTermsOf,
  loadDefinitionRelatedTermsTargeting,
} from "../../action/AsyncTermActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermOccurrence from "../../model/TermOccurrence";
import TermIriLink from "./TermIriLink";
import "./DefinitionRelatedTerms.scss";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";
import classNames from "classnames";
import Utils from "../../util/Utils";
import AppNotification from "../../model/AppNotification";
import ActionType from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { consumeNotification } from "../../action/SyncActions";

export interface DefinitionRelatedTermsProps extends HasI18n {
  term: Term;

  relatedTerms: DefinitionallyRelatedTerms;
  notifications: AppNotification[];
  loadDefinitionRelatedTermsTargeting(term: Term): Promise<any>;
  loadDefinitionRelatedTermsOf(term: Term): Promise<any>;
  consumeNotification(notification: AppNotification): void;
}

interface DefinitionRelatedTermsState {
  showStaleNotice: boolean;
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

/**
 * Timeout before reloading related terms in case text analysis of all terms in a vocabulary is running on the backend.
 *
 * In ms.
 */
const RELOAD_TIMEOUT = 20000;

export class DefinitionRelatedTerms extends React.Component<
  DefinitionRelatedTermsProps,
  DefinitionRelatedTermsState
> {
  private reloadSchedule?: ReturnType<typeof setTimeout>;

  public constructor(props: DefinitionRelatedTermsProps) {
    super(props);
    this.state = { showStaleNotice: false };
  }

  public componentDidMount(): void {
    this.loadRelated();
    this.scheduleReloadIfNecessary();
  }

  private loadRelated() {
    this.loadRelatedTargeting();
    this.loadRelatedOf();
  }

  private loadRelatedTargeting() {
    this.props.loadDefinitionRelatedTermsTargeting(this.props.term);
  }

  private loadRelatedOf() {
    this.props.loadDefinitionRelatedTermsOf(this.props.term);
  }

  private scheduleReloadIfNecessary() {
    const notification = this.getRelevantNotification();
    if (!notification || this.state.showStaleNotice) {
      return;
    }
    this.setState({ showStaleNotice: true });
    this.reloadSchedule = setTimeout(() => {
      // Ensure the notification is consumed (if someone else hasn't done it already)
      this.props.consumeNotification(notification);
      this.reloadSchedule = undefined;
      this.setState({ showStaleNotice: false });
      this.loadRelated();
    }, RELOAD_TIMEOUT);
  }

  public componentDidUpdate(
    prevProps: Readonly<DefinitionRelatedTermsProps>
  ): void {
    if (this.props.term.iri !== prevProps.term.iri) {
      this.loadRelated();
      return;
    }
    this.scheduleReloadIfNecessary();
  }

  /**
   * Text analysis may be running if a new term has been created or an existing term's label has been updated.
   */
  private getRelevantNotification() {
    return this.props.notifications.find((n) =>
      DefinitionRelatedTerms.isNotificationRelevant(n)
    );
  }

  private static isNotificationRelevant(n: AppNotification) {
    return (
      (n.source.type === ActionType.CREATE_VOCABULARY_TERM &&
        n.source.status === AsyncActionStatus.SUCCESS) ||
      Utils.generateIsAssetLabelUpdate(VocabularyUtils.TERM)(n)
    );
  }

  componentWillUnmount() {
    if (this.reloadSchedule) {
      clearTimeout(this.reloadSchedule);
    }
  }

  public render() {
    const i18n = this.props.i18n;
    return (
      <>
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label">
              {i18n("term.metadata.related.definitionally")}
              <InfoIcon
                id="term-metadata-related-definitionally-info"
                text={i18n("term.metadata.related.definitionally.tooltip")}
              />
            </Label>
          </Col>

          <Col xl={10} md={8}>
            {this.state.showStaleNotice && (
              <Alert color="info" className="italics">
                {i18n("term.metadata.related.definitionally.stale")}
              </Alert>
            )}
            {this.renderOccurrencesTable()}
          </Col>
        </Row>
      </>
    );
  }

  private renderOccurrencesTable() {
    const { term, relatedTerms, i18n } = this.props;
    const rowsTargeting = reduceToUnique(
      DefinitionRelatedTerms.prioritizeApproved(
        relatedTerms.targeting,
        this.props.term
      ),
      (o) => o.term.iri!
    ).map((t) => this.renderRow(t, (t) => t.term.iri!));
    const rowsOf = reduceToUnique(
      DefinitionRelatedTerms.prioritizeApproved(relatedTerms.of, term),
      (o) => o.target.source.iri!
    ).map((t) =>
      this.renderRow(t, (t) =>
        t.target.source.iri ? t.target.source.iri : t.iri!
      )
    );
    return (
      <Row className="mt-1">
        <Col xl={6} xs={12}>
          <h5>{i18n("term.metadata.related.definitionally.targeting")}</h5>
          <Table responsive={true} striped={true}>
            <tbody>{rowsTargeting}</tbody>
          </Table>
        </Col>
        <Col xl={6} xs={12}>
          <h5>{i18n("term.metadata.related.definitionally.of")}</h5>
          <Table responsive={true} striped={true}>
            <tbody>{rowsOf}</tbody>
          </Table>
        </Col>
      </Row>
    );
  }

  private renderRow(
    to: TermOccurrence,
    getter: (to: TermOccurrence) => string
  ) {
    return (
      <tr key={to.iri}>
        <td
          className={classNames("align-middle", { italics: to.isSuggested() })}
        >
          {to.isSuggested() && (
            <InfoIcon
              className="mr-1"
              text={this.props.i18n(
                "term.metadata.related.definitionally.suggested"
              )}
              id={`term-metadata-definition-suggested-${Utils.hashCode(
                to.iri!
              )}`}
            />
          )}
          <TermIriLink iri={getter(to)} />
        </td>
      </tr>
    );
  }

  public static prioritizeApproved(
    occurrences: TermOccurrence[],
    currentTerm: Term
  ) {
    const copy = occurrences.slice();
    copy.sort((a, b) => {
      const suggestedA = a.isSuggested();
      const suggestedB = b.isSuggested();
      if (suggestedA !== suggestedB) {
        return suggestedA ? 1 : -1;
      }
      const iriA =
        a.term.iri === currentTerm.iri ? a.target.source.iri! : a.term.iri!;
      const iriB =
        b.term.iri === currentTerm.iri ? b.target.source.iri! : b.term.iri!;
      return iriA.localeCompare(iriB);
    });
    return copy;
  }
}

export default connect(
  (state: TermItState) => ({
    relatedTerms: state.definitionallyRelatedTerms,
    notifications: state.notifications,
  }),
  (dispatch: ThunkDispatch) => {
    return {
      loadDefinitionRelatedTermsTargeting: (term: Term) =>
        dispatch(
          loadDefinitionRelatedTermsTargeting(
            VocabularyUtils.create(term.iri).fragment,
            VocabularyUtils.create(term.vocabulary!.iri!)
          )
        ),
      loadDefinitionRelatedTermsOf: (term: Term) =>
        dispatch(
          loadDefinitionRelatedTermsOf(
            VocabularyUtils.create(term.iri).fragment,
            VocabularyUtils.create(term.vocabulary!.iri!)
          )
        ),
      consumeNotification: (n: AppNotification) =>
        dispatch(consumeNotification(n)),
    };
  }
)(injectIntl(withI18n(DefinitionRelatedTerms)));
