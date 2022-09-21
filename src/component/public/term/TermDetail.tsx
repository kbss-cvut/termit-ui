import * as React from "react";
import withI18n from "../../hoc/withI18n";
import { IRI } from "../../../util/VocabularyUtils";
import Utils from "../../../util/Utils";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import { injectIntl } from "react-intl";
import TermMetadata from "./TermMetadata";
import {
  getLocalized,
  getLocalizedPlural,
} from "../../../model/MultilingualString";
import {
  CommonTermDetailProps,
  resolveInitialLanguage,
} from "../../term/TermDetail";
import WindowTitle from "../../misc/WindowTitle";
import { loadVocabulary } from "../../../action/AsyncActions";
import { loadTerm } from "../../../action/AsyncTermActions";
import { useLocation, useParams } from "react-router-dom";

interface TermDetailProps extends CommonTermDetailProps {}

export const TermDetail: React.FC<TermDetailProps> = (props) => {
  const { term, loadTerm, loadVocabulary } = props;
  const { name, termName, timestamp } = useParams<any>();
  const location = useLocation();
  React.useEffect(() => {
    const namespace = Utils.extractQueryParam(location.search, "namespace");
    const vocUri = { fragment: name, namespace };
    loadTerm(termName, vocUri, timestamp);
    loadVocabulary(vocUri, timestamp);
  }, [location.search, name, termName, timestamp, loadTerm, loadVocabulary]);
  const [language, setLanguage] = React.useState<string>(
    resolveInitialLanguage(props)
  );
  React.useEffect(() => {
    setLanguage(resolveInitialLanguage(props));
  }, [term, props]);

  if (!term) {
    return null;
  }
  const altLabels = getLocalizedPlural(term.altLabels, language)
    .sort()
    .join(", ");

  return (
    <div id="public-term-detail">
      <WindowTitle
        title={`${getLocalized(term.label, language)} | ${
          props.vocabulary.label
        }`}
      />
      <HeaderWithActions
        title={
          <>
            {getLocalized(term.label, language)}
            <CopyIriIcon url={term.iri as string} />
            <div className="small italics">
              {altLabels.length > 0 ? altLabels : "\u00a0"}
            </div>
          </>
        }
      />
      <TermMetadata
        term={term}
        vocabulary={props.vocabulary}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
};

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
      loadVocabulary: (iri: IRI, timestamp?: string) =>
        dispatch(loadVocabulary(iri, false, timestamp)),
      loadTerm: (termName: string, vocabularyIri: IRI, timestamp?: string) =>
        dispatch(loadTerm(termName, vocabularyIri, timestamp)),
    };
  }
)(injectIntl(withI18n(TermDetail)));
