import * as React from "react";
import AssetLink from "../misc/AssetLink";
import Term, {TermInfo} from "../../model/Term";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import OutgoingLink from "../misc/OutgoingLink";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {Routing} from "../../util/Routing";
import Routes from "../../util/Routes";
import VocabularyUtils from "../../util/VocabularyUtils";
import Authentication from "../../util/Authentication";
import {getLocalized} from "../../model/MultilingualString";
import {getShortLocale} from "../../util/IntlUtil";

interface TermLinkProps extends HasI18n {
    term: Term | TermInfo;
    id?: string;

    user: User;
}

export function getTermPath(term: Term | TermInfo, user?: User | null) {
    if (!term.vocabulary) {
        return Routing.getTransitionPath(Routes.dashboard);
    }
    const vocIri = VocabularyUtils.create(term.vocabulary!.iri!);
    const iri = VocabularyUtils.create(term.iri);
    return Routing.getTransitionPath(Authentication.isLoggedIn(user) ? Routes.vocabularyTermDetail : Routes.publicVocabularyTermDetail,
        {
            params: new Map([["name", vocIri.fragment], ["termName", iri.fragment]]),
            query: new Map([["namespace", vocIri.namespace!]])
        });
}

export const TermLink: React.FC<TermLinkProps> = (props) => {
    const {term} = props;
    const label = getLocalized(term.label, getShortLocale(props.locale));
    if (!term.vocabulary) {
        // This can happen e.g. when FTS returns a term in the predefined language used for term types
        return <OutgoingLink label={label} iri={term.iri}/>;
    }
    const path = getTermPath(term, props.user);
    // Make a copy of the term with a simple localized label for the AssetLink component
    const t = Object.assign({}, term, {label});

    return <AssetLink id={props.id}
                      asset={t}
                      path={path}
                      tooltip={props.i18n("asset.link.tooltip")}/>
};

export default connect((state: TermItState) => ({user: state.user}))(injectIntl(withI18n(TermLink)));
