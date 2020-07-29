import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {RouteComponentProps, withRouter} from "react-router";
import Term from "../../../model/Term";
import {IRI} from "../../../util/VocabularyUtils";
import Utils from "../../../util/Utils";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";
import {ThunkDispatch} from "../../../util/Types";
import {injectIntl} from "react-intl";
import TermMetadata from "./TermMetadata";
import {loadPublicTerm, loadPublicVocabulary} from "../../../action/AsyncPublicViewActions";
import Vocabulary from "../../../model/Vocabulary";

interface TermDetailProps extends HasI18n, RouteComponentProps<any> {
    term: Term | null;
    vocabulary: Vocabulary;
    loadVocabulary: (iri: IRI) => void;
    loadTerm: (termName: string, vocabularyIri: IRI) => void;
}

const TermDetail: React.FC<TermDetailProps> = props => {
    const {term, location, match, loadTerm, loadVocabulary} = props;
    React.useEffect(() => {
        const vocabularyName: string = match.params.name;
        const termName: string = match.params.termName;
        const namespace = Utils.extractQueryParam(location.search, "namespace");
        const vocUri = {fragment: vocabularyName, namespace};
        loadTerm(termName, vocUri);
        loadVocabulary(vocUri);
    }, [match.params.termName, loadTerm, loadVocabulary]);

    if (!term) {
        return null;
    }
    return <div id="public-term-detail">
        <HeaderWithActions title={<>{term.label}<CopyIriIcon url={term.iri as string}/></>}/>
        <TermMetadata term={term} vocabulary={props.vocabulary}/>
    </div>;
}

export default connect((state: TermItState) => {
    return {
        term: state.selectedTerm,
        vocabulary: state.vocabulary
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadVocabulary: (iri: IRI) => dispatch(loadPublicVocabulary(iri)),
        loadTerm: (termName: string, vocabularyIri: IRI) => dispatch(loadPublicTerm(termName, vocabularyIri))
    };
})(injectIntl(withI18n(withRouter(TermDetail))));
