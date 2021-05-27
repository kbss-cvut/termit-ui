import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { RouteComponentProps, withRouter } from "react-router";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  loadTerm,
  loadVocabulary,
  removeTerm,
  updateTerm,
} from "../../action/AsyncActions";
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
import HeaderWithActions from "../misc/HeaderWithActions";
import CopyIriIcon from "../misc/CopyIriIcon";
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

export interface CommonTermDetailProps extends HasI18n {
  configuredLanguage: string;
  term: Term | null;
  vocabulary: Vocabulary;
  loadVocabulary: (iri: IRI) => void;
  loadTerm: (termName: string, vocabularyIri: IRI) => void;
}

interface TermDetailProps
  extends CommonTermDetailProps,
    RouteComponentProps<any> {
  updateTerm: (term: Term) => Promise<any>;
  removeTerm: (term: Term) => Promise<any>;
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
    this.loadTerm();
    this.loadVocabulary();
  }

  private loadVocabulary(): void {
    const vocabularyName: string = this.props.match.params.name;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    this.props.loadVocabulary({ fragment: vocabularyName, namespace });
  }

  private loadTerm(): void {
    const vocabularyName: string = this.props.match.params.name;
    const termName: string = this.props.match.params.termName;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    this.props.loadTerm(termName, { fragment: vocabularyName, namespace });
  }

  public componentDidUpdate(prevProps: TermDetailProps) {
    const currTermName = this.props.match.params.termName;
    const currVocabularyName = this.props.match.params.name;
    const prevTermName = prevProps.match.params.termName;
    const prevVocabularyName = prevProps.match.params.name;
    if (
      currTermName !== prevTermName ||
      currVocabularyName !== prevVocabularyName
    ) {
      this.onCloseEdit();
      this.loadTerm();
      if (currVocabularyName !== prevVocabularyName) {
        this.loadVocabulary();
      }
    }
    if (prevProps.term?.iri !== this.props.term?.iri) {
      this.setState({ language: resolveInitialLanguage(this.props) });
    }
  }

  public setLanguage = (language: string) => {
    this.setState({ language });
  };

  public onSave = (term: Term) => {
    const oldTerm = this.props.term!;
    this.props.updateTerm(term).then(() => {
      this.loadTerm();
      this.onCloseEdit();
      if (
        _.xorBy(
          oldTerm.parentTerms,
          Utils.sanitizeArray(term.parentTerms),
          (t) => t.iri
        ).length > 0
      ) {
        this.props.publishNotification({
          source: { type: NotificationType.TERM_HIERARCHY_UPDATED },
        });
      }
    });
  };

  public onRemove = () => {
    this.props.removeTerm(this.props.term!).then(() => {
      this.onCloseRemove();
    });
  };

  public getActions = () => {
    const i18n = this.props.i18n;
    const actions = [];
    if (!this.state.edit) {
      const isConfirmed = !Term.isDraft(this.props.term!);
      actions.push(
        <Button
          id="term-detail-edit"
          size="sm"
          color="primary"
          onClick={this.onEdit}
          key="term-detail-edit"
          disabled={isConfirmed}
          title={i18n(isConfirmed ? "term.edit.confirmed.tooltip" : "edit")}
        >
          <GoPencil className="mr-1" />
          {i18n("edit")}
        </Button>
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
          title={i18n("asset.remove.tooltip")}
          onClick={this.onRemoveClick}
        >
          <FaTrashAlt className="mr-1" />
          {i18n("remove")}
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
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
      loadTerm: (termName: string, vocabularyIri: IRI) =>
        dispatch(loadTerm(termName, vocabularyIri)),
      updateTerm: (term: Term) => dispatch(updateTerm(term)),
      removeTerm: (term: Term) => dispatch(removeTerm(term)),
      publishNotification: (notification: AppNotification) =>
        dispatch(publishNotification(notification)),
    };
  }
)(injectIntl(withI18n(withRouter(TermDetail))));
