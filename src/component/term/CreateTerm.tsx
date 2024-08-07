import * as React from "react";
import Term from "../../model/Term";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { createTerm } from "../../action/AsyncTermActions";
import { loadVocabulary } from "../../action/AsyncActions";
import TermMetadataCreate from "./TermMetadataCreate";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import IdentifierResolver from "../../util/IdentifierResolver";
import TermItState from "../../model/TermItState";
import Vocabulary, { EMPTY_VOCABULARY } from "../../model/Vocabulary";
import Utils from "../../util/Utils";
import { RouteComponentProps } from "react-router";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { injectIntl } from "react-intl";
import WindowTitle from "../misc/WindowTitle";
import { getLocalized } from "../../model/MultilingualString";

interface CreateTermProps extends RouteComponentProps<any>, HasI18n {
  vocabulary: Vocabulary;
  createTerm: (term: Term, vocabularyIri: IRI) => Promise<string | undefined>;
  language: string;

  loadVocabulary(iri: IRI): void;
}

export class CreateTerm extends React.Component<CreateTermProps> {
  public componentDidMount(): void {
    this.loadVocabulary();
  }

  private loadVocabulary(): void {
    const normalizedName = this.props.match.params.name;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    const iri = VocabularyUtils.create(this.props.vocabulary.iri);
    if (
      iri.fragment !== normalizedName ||
      (namespace && iri.namespace !== namespace)
    ) {
      this.props.loadVocabulary({ fragment: normalizedName, namespace });
    }
  }

  public onCreate = (term: Term, newTerm: boolean) => {
    const vocabularyIri = VocabularyUtils.create(this.props.vocabulary.iri);
    this.props.createTerm(term, vocabularyIri).then((location?: string) => {
      if (!location) {
        return;
      }
      const termName = IdentifierResolver.extractNameFromLocation(location);
      const params = new Map([["name", vocabularyIri.fragment]]);
      const query = new Map([["namespace", vocabularyIri.namespace!]]);
      if (newTerm) {
        Routing.transitionTo(Routes.createVocabularyTerm, { params, query });
        Routing.reload();
      } else {
        params.set("termName", termName);
        Routing.transitionTo(Routes.vocabularyTermDetail, { params, query });
      }
    });
  };

  public render() {
    const vocabulary = this.props.vocabulary;
    if (vocabulary !== EMPTY_VOCABULARY) {
      return (
        <>
          <WindowTitle
            title={`${this.props.i18n("glossary.new")} | ${getLocalized(
              vocabulary.label,
              this.props.language
            )}`}
          />
          <TermMetadataCreate
            onCreate={this.onCreate}
            vocabularyIri={this.props.vocabulary.iri}
          />
        </>
      );
    }
    return null;
  }
}

export default connect(
  (state: TermItState) => {
    return {
      language: state.configuration.language,
      vocabulary: state.vocabulary,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      createTerm: (term: Term, vocabularyIri: IRI) =>
        dispatch(createTerm(term, vocabularyIri)),
      loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
    };
  }
)(injectIntl(withI18n(CreateTerm)));
