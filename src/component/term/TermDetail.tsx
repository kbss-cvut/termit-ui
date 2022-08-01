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
import { IRI } from "../../util/VocabularyUtils";
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
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import { DefinitionRelatedChanges } from "./DefinitionRelatedTermsEdit";
import TermOccurrence from "../../model/TermOccurrence";
import {
  approveOccurrence,
  loadTerm,
  removeOccurrence,
} from "../../action/AsyncTermActions";

export interface CommonTermDetailProps extends HasI18n {
  configuredLanguage: string;
  versionSeparator: string;
  term: Term | null;
  vocabulary: Vocabulary;
  loadVocabulary: (iri: IRI) => void;
  loadTerm: (termName: string, vocabularyIri: IRI, timestamp?: string) => void;
}

interface TermDetailProps
  extends CommonTermDetailProps,
    RouteComponentProps<any> {
  updateTerm: (term: Term) => Promise<any>;
  removeTerm: (term: Term) => Promise<any>;
  approveOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  removeOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  publishNotification: (notification: AppNotification) => void;
}

export interface TermDetailState extends EditableComponentState {
  language: string;
}

export function resolveInitialLanguage(props: CommonTermDetailProps) {
  const { term, configuredLanguage, locale } = props;
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
    let vocabularyIri;
    if (timestamp) {
      vocabularyIri = {
        fragment: timestamp,
        namespace: `${namespace}${name}${this.props.versionSeparator}/`,
      };
    } else {
      vocabularyIri = { fragment: name, namespace };
    }
    this.props.loadVocabulary(vocabularyIri);
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
    const isConfirmed = !Term.isDraft(this.props.term);
    const actions = [];
    if (!this.state.edit) {
      actions.push(
        <IfUserAuthorized
          key="term-detail-edit"
          renderUnauthorizedAlert={false}
        >
          <Button
            id="term-detail-edit"
            size="sm"
            color="primary"
            onClick={this.onEdit}
            key="term-detail-edit"
            disabled={isConfirmed}
            title={this.props.i18n(
              isConfirmed ? "term.metadata.status.confirmed.edit.title" : "edit"
            )}
          >
            <GoPencil />
            &nbsp;{this.props.i18n("edit")}
          </Button>
        </IfUserAuthorized>
      );
    }
    actions.push(
      <IfUserAuthorized
        key="term-detail-remove"
        renderUnauthorizedAlert={false}
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
      </IfUserAuthorized>
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
          title={`${getLocalized(term.label, this.state.language)} | ${
            vocabulary.label
          }`}
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
    const altLabels = getLocalizedPlural(term.altLabels, this.state.language)
      .sort()
      .join(", ");
    return (
      <>
        <TermQualityBadge term={term} />
        {getLocalized(term.label, this.state.language)}
        <CopyIriIcon url={term.iri as string} />
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
      loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
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
)(injectIntl(withI18n(withRouter(TermDetail))));
