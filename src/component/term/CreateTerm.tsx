import * as React from "react";
import Term from "../../model/Term";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {createTerm, loadVocabulary} from "../../action/AsyncActions";
import TermMetadataCreate from "./TermMetadataCreate";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import IdentifierResolver from "../../util/IdentifierResolver";
import TermItState from "../../model/TermItState";
import Vocabulary, {EMPTY_VOCABULARY} from "../../model/Vocabulary";
import Utils from "../../util/Utils";
import {RouteComponentProps} from "react-router";

interface CreateTermProps extends RouteComponentProps<any> {
    vocabulary: Vocabulary;
    createTerm: (term: Term, vocabularyIri: IRI) => Promise<string>;
    loadVocabulary(iri: IRI): void;
}

export class CreateTerm extends React.Component<CreateTermProps> {
    public componentDidMount(): void {
        this.loadVocabulary();
    }

    private loadVocabulary(): void {
        const normalizedName = this.props.match.params.name;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        const iri = VocabularyUtils.create(this.props.vocabulary.iri);
        if (iri.fragment !== normalizedName || (namespace && iri.namespace !== namespace)) {
            this.props.loadVocabulary({fragment: normalizedName, namespace});
        }
    }

    public onCreate = (term: Term, newTerm : boolean) => {
        const vocabularyIri = VocabularyUtils.create(this.props.vocabulary.iri);
        this.props.createTerm(term, vocabularyIri).then((location: string) => {
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
        return this.props.vocabulary !== EMPTY_VOCABULARY ?
            <TermMetadataCreate onCreate={this.onCreate} vocabularyIri={this.props.vocabulary.iri}/> : null;
    }
}

export default connect((state: TermItState) => {
    return {
        vocabulary: state.vocabulary
    };
}, (dispatch: ThunkDispatch) => {
    return {
        createTerm: (term: Term, vocabularyIri: IRI) => dispatch(createTerm(term, vocabularyIri)),
        loadVocabulary: (iri: IRI) => dispatch(loadVocabulary(iri)),
    };
})(CreateTerm);
