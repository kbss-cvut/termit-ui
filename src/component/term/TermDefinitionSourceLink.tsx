import * as React from "react";
import Term from "../../model/Term";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes, {Route} from "../../util/Routes";
import ResourceIriLink from "../resource/ResourceIriLink";
import {Button} from "reactstrap";
import {GoFileSymlinkFile} from "react-icons/go";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";
import Routing from "../../util/Routing";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {pushRoutingPayload} from "../../action/SyncActions";

interface TermDefinitionSourceLinkProps extends HasI18n {
    term: Term;

    pushRoutingPayload: (route: Route, payload: any) => void;
}

export const TermDefinitionSourceLink: React.FC<TermDefinitionSourceLinkProps> = props => {
    const defSource = props.term.definitionSource;
    const navigateToDefinitionSource = () => {
        const target = defSource!.target;
        const targetIri = VocabularyUtils.create(target.source.iri!);
        // assert target.selectors.length === 1
        props.pushRoutingPayload(Routes.annotateFile, {selector: Utils.sanitizeArray(target.selectors)[0]});
        Routing.transitionTo(Routes.annotateFile, {
            params: new Map([["name", targetIri.fragment]]),
            query: new Map([["namespace", targetIri.namespace!]])
        });
    };

    return <>
        <ResourceIriLink id="term-metadata-definitionSource" iri={defSource!.target.source.iri!}/>
        <Button id="term-metadata-definitionSource-goto" color="primary" outline={true} size="sm"
                onClick={navigateToDefinitionSource}
                title={props.i18n("term.metadata.definitionSource.goto.tooltip")}>
            <GoFileSymlinkFile/>&nbsp;
            {props.i18n("term.metadata.definitionSource.goto")}
        </Button>
    </>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        pushRoutingPayload: (route: Route, payload: any) => dispatch(pushRoutingPayload(route, payload))
    };
})(injectIntl(withI18n(TermDefinitionSourceLink)));
