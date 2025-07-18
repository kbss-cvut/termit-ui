import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  loadVocabulary,
  removeTerm,
  updateTerm,
} from "../../action/AsyncActions";
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";
import TermMetadata from "./TermMetadata";
import Term from "../../model/Term";
import TermItState from "../../model/TermItState";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import EditableComponent, {
  EditableComponentState,
} from "../misc/EditableComponent";
import TermMetadataEdit from "./TermMetadataEdit";
import Utils from "../../util/Utils";
import AppNotification from "../../model/AppNotification";
import { publishNotification } from "../../action/SyncActions";
import NotificationType from "../../model/NotificationType";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import * as _ from "lodash";
import Vocabulary from "../../model/Vocabulary";
import { FaTrashAlt } from "react-icons/fa";
import RemoveAssetDialog from "../asset/RemoveAssetDialog";
import {
  getLocalized,
  getLocalizedPlural,
} from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import TermQualityBadge from "./TermQualityBadge";
import WindowTitle from "../misc/WindowTitle";
import { DefinitionRelatedChanges } from "./DefinitionRelatedTermsEdit";
import TermOccurrence from "../../model/TermOccurrence";
import {
  approveOccurrence,
  loadDefinitionRelatedTermsTargeting,
  loadTerm,
  removeOccurrence,
} from "../../action/AsyncTermActions";
import TermReadOnlyIcon from "./authorization/TermReadOnlyIcon";
import TermSnapshotIcon from "./snapshot/TermSnapshotIcon";
import classNames from "classnames";
import SnapshotCreationInfo from "../snapshot/SnapshotCreationInfo";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import StoreBasedTerminalTermStateIcon from "./state/StoreBasedTerminalTermStateIcon";
import IfNotInTerminalState from "./state/IfNotInTerminalState";
import { IMessage, withStompClient, withSubscription } from "react-stomp-hooks";
import { HasStompClient, StompClient } from "../hoc/withStompClient";
import Constants from "../../util/Constants";
import { vocabularyValidation } from "../../reducer/WebSocketVocabularyDispatchers";
import { requestVocabularyValidation } from "../../action/WebSocketVocabularyActions";

const USER_VOCABULARIES_VALIDATION_ENDPOINT =
  "/user" + Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_VALIDATION;

export interface CommonTermDetailProps extends HasI18n {
  configuredLanguage: string;
  versionSeparator: string;
  term: Term | null;
  vocabulary: Vocabulary;
  loadVocabulary: (iri: IRI, timestamp?: string) => void;
  loadTerm: (termName: string, vocabularyIri: IRI, timestamp?: string) => void;
}

interface TermDetailProps
  extends CommonTermDetailProps,
    HasStompClient,
    RouteComponentProps<any> {
  updateTerm: (term: Term) => Promise<any>;
  removeTerm: (term: Term) => Promise<any>;
  requestVocabularyValidation: (
    vocabularyIri: IRI,
    stompClient: StompClient
  ) => void;
  loadDefinitionRelatedTermsTargeting: (termIri: IRI) => void;
  vocabularyValidation: (message: IMessage, vocabularyIri: string) => void;
  approveOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  removeOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  publishNotification: (notification: AppNotification) => void;
}

export interface TermDetailState extends EditableComponentState {
  language: string;
}

export function resolveInitialLanguage(props: CommonTermDetailProps) {
  const { term, configuredLanguage, locale } = props;
  if (props.vocabulary.primaryLanguage) return props.vocabulary.primaryLanguage;
  const supported = term ? Term.getLanguages(term) : [];
  const langLocale = getShortLocale(locale);
  return supported.indexOf(langLocale) !== -1 ? langLocale : configuredLanguage;
}

export class TermDetail extends EditableComponent<
  TermDetailProps,
  TermDetailState
> {
  constructor(props: TermDetailProps) {
    super(props);
    this.state = {
      edit: false,
      showRemoveDialog: false,
      language: resolveInitialLanguage(props),
    };
  }

  public componentDidMount(): void {
    this.load();
  }

  private load(): void {
    this.loadTerm();
    this.loadVocabulary();
  }

  private loadVocabulary(): void {
    const { name, timestamp } = this.props.match.params;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    const iri: IRI = { fragment: name, namespace };
    this.props.loadVocabulary(iri, timestamp);
    this.props.requestVocabularyValidation(iri, this.props.stompClient);
  }

  private loadTerm(): void {
    const { name, termName, timestamp } = this.props.match.params;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    this.props.loadTerm(termName, { fragment: name, namespace }, timestamp);
  }

  public componentDidUpdate(prevProps: TermDetailProps) {
    if (Utils.didNavigationOccur(prevProps, this.props)) {
      this.onCloseEdit();
      this.load();
    }
    if (prevProps.term?.iri !== this.props.term?.iri) {
      this.setState({ language: resolveInitialLanguage(this.props) });
    }
  }

  // used by withSubscription
  public onMessage = (message: IMessage) => {
    switch (message?.headers?.destination) {
      case USER_VOCABULARIES_VALIDATION_ENDPOINT:
        this.props.vocabularyValidation(message, this.props.vocabulary.iri);
        break;
      case Constants.WEBSOCKET_ENDPOINT
        .VOCABULARIES_TEXT_ANALYSIS_FINISHED_TERM_DEFINITION:
        if (this.props.term?.iri && this.props.term.iri === message.body) {
          this.props.loadDefinitionRelatedTermsTargeting(
            VocabularyUtils.create(this.props.term.iri)
          );
        }
        break;
    }
  };

  public setLanguage = (language: string) => {
    this.setState({ language });
  };

  public onSave = (
    term: Term,
    definitionRelatedChanges: DefinitionRelatedChanges
  ) => {
    const oldTerm = this.props.term!;
    return this.props
      .updateTerm(term)
      .then(() =>
        Promise.all(
          definitionRelatedChanges.pendingApproval.map((o) =>
            this.props.approveOccurrence(o)
          )
        )
      )
      .then(() =>
        Promise.all(
          definitionRelatedChanges.pendingRemoval.map((o) =>
            this.props.removeOccurrence(o)
          )
        )
      )
      .then(() => {
        this.loadTerm();
        this.onCloseEdit();
        this.publishNotificationIfRelevant(term, oldTerm);
        return Promise.resolve();
      });
  };

  private publishNotificationIfRelevant(newTerm: Term, oldTerm: Term) {
    if (
      _.xorBy(
        oldTerm.parentTerms,
        Utils.sanitizeArray(newTerm.parentTerms),
        (t) => t.iri
      ).length > 0
    ) {
      this.props.publishNotification({
        source: { type: NotificationType.TERM_HIERARCHY_UPDATED },
      });
    }
  }

  public onRemove = () => {
    this.props.removeTerm(this.props.term!).then(() => {
      this.onCloseRemove();
    });
  };

  public getActions = () => {
    const actions = [];
    if (!this.state.edit) {
      actions.push(
        <IfNotInTerminalState
          term={this.props.term!}
          key="term-detail-edit-terminal"
        >
          <IfVocabularyActionAuthorized
            key="term-detail-edit"
            vocabulary={this.props.vocabulary}
            requiredAccessLevel={AccessLevel.WRITE}
          >
            <Button
              id="term-detail-edit"
              key="term.detail.edit"
              size="sm"
              color="primary"
              onClick={this.onEdit}
              title={this.props.i18n("edit")}
            >
              <GoPencil />
              &nbsp;{this.props.i18n("edit")}
            </Button>
          </IfVocabularyActionAuthorized>
        </IfNotInTerminalState>
      );
    }
    actions.push(
      <IfVocabularyActionAuthorized
        key="term-detail-remove"
        vocabulary={this.props.vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <Button
          id="term-detail-remove"
          key="term.summary.remove"
          size="sm"
          color="outline-danger"
          title={this.props.i18n("asset.remove.tooltip")}
          onClick={this.onRemoveClick}
        >
          <FaTrashAlt />
          &nbsp;{this.props.i18n("remove")}
        </Button>
      </IfVocabularyActionAuthorized>
    );
    return actions;
  };

  public render() {
    const { term, vocabulary } = this.props;
    if (!term) {
      return null;
    }
    const buttons = this.getActions();
    return (
      <div id="term-detail">
        <WindowTitle
          title={`${getLocalized(
            term.label,
            this.state.language
          )} | ${getLocalized(vocabulary.label, this.state.language)}`}
        />

        <HeaderWithActions title={this.renderTitle()} actions={buttons} />
        <RemoveAssetDialog
          show={this.state.showRemoveDialog}
          asset={term}
          onCancel={this.onCloseRemove}
          onSubmit={this.onRemove}
        />
        {this.state.edit ? (
          <TermMetadataEdit
            save={this.onSave}
            term={term}
            cancel={this.onCloseEdit}
            language={this.state.language}
            selectLanguage={this.setLanguage}
          />
        ) : (
          <TermMetadata
            term={term}
            vocabulary={vocabulary}
            language={this.state.language}
            selectLanguage={this.setLanguage}
          />
        )}
      </div>
    );
  }

  private renderTitle() {
    const term = this.props.term!;
    const labelClass = classNames({ "text-muted": term.isSnapshot() });
    const altLabels = getLocalizedPlural(term.altLabels, this.state.language)
      .sort()
      .join(", ");
    return (
      <>
        <TermQualityBadge term={term} />
        <TermSnapshotIcon term={term} vocabulary={this.props.vocabulary} />
        <span className={labelClass}>
          {getLocalized(term.label, this.state.language)}
        </span>
        <SnapshotCreationInfo asset={term} />
        <CopyIriIcon url={term.iri as string} />
        <TermReadOnlyIcon
          term={term}
          accessLevel={this.props.vocabulary.accessLevel}
        />
        <StoreBasedTerminalTermStateIcon term={term} id="term-detail-state" />
        <br />
        <div className="small italics">
          {altLabels.length > 0 ? altLabels : "\u00a0"}
        </div>
      </>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      term: state.selectedTerm,
      vocabulary: state.vocabulary,
      configuredLanguage: state.configuration.language,
      versionSeparator: state.configuration.versionSeparator,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadVocabulary: (iri: IRI, timestamp?: string) =>
        dispatch(loadVocabulary(iri, timestamp)),
      requestVocabularyValidation: (
        vocabularyIri: IRI,
        stompClient: StompClient
      ) => dispatch(requestVocabularyValidation(vocabularyIri, stompClient)),
      loadDefinitionRelatedTermsTargeting: (termIri: IRI) =>
        dispatch(loadDefinitionRelatedTermsTargeting(termIri)),
      vocabularyValidation: (message: IMessage, vocabularyIri: string) =>
        dispatch(vocabularyValidation(message, vocabularyIri)),
      loadTerm: (termName: string, vocabularyIri: IRI, timestamp?: string) =>
        dispatch(loadTerm(termName, vocabularyIri, timestamp)),
      updateTerm: (term: Term) => dispatch(updateTerm(term)),
      removeTerm: (term: Term) => dispatch(removeTerm(term)),
      approveOccurrence: (occurrence: TermOccurrence) =>
        dispatch(approveOccurrence(occurrence)),
      removeOccurrence: (occurrence: TermOccurrence) =>
        dispatch(removeOccurrence(occurrence)),
      publishNotification: (notification: AppNotification) =>
        dispatch(publishNotification(notification)),
    };
  }
)(
  injectIntl(
    withI18n(
      withRouter(
        withStompClient(
          withSubscription(TermDetail, [
            USER_VOCABULARIES_VALIDATION_ENDPOINT,
            Constants.WEBSOCKET_ENDPOINT
              .VOCABULARIES_TEXT_ANALYSIS_FINISHED_TERM_DEFINITION,
          ])
        )
      )
    )
  )
);
