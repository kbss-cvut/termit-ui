import * as React from "react";
import Vocabulary from "../../model/Vocabulary";
import AssetLink from "../misc/AssetLink";
import VocabularyUtils from "../../util/VocabularyUtils";
import {Routing} from "../../util/Routing";
import Routes from "../../util/Routes";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import User from "../../model/User";
import Authentication from "../../util/Authentication";
import {useI18n} from "../hook/useI18n";

interface VocabularyLinkProps {
    vocabulary: Vocabulary;
    id?: string;

    user: User;
}

export const VocabularyLink = (props: VocabularyLinkProps) => {
    const {i18n} = useI18n();
    const iri = VocabularyUtils.create(props.vocabulary.iri);
    const path = Routing.getTransitionPath(Authentication.isLoggedIn(props.user) ? Routes.vocabularySummary : Routes.publicVocabularySummary,
        {
            params: new Map([["name", iri.fragment]]),
            query: new Map([["namespace", iri.namespace!]])
        });
    return <AssetLink id={props.id}
                      asset={props.vocabulary}
                      path={path}
                      tooltip={i18n("asset.link.tooltip")}/>;
};

export default connect((state: TermItState) => ({user: state.user}))(VocabularyLink);
