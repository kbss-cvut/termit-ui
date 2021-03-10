import * as React from "react";
import Term from "../../model/Term";
import Routes from "../../util/Routes";
import {Button} from "reactstrap";
import {GoFileSymlinkFile} from "react-icons/go";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";
import Routing from "../../util/Routing";
import {useDispatch} from "react-redux";
import {pushRoutingPayload} from "../../action/SyncActions";
import {useI18n} from "../hook/useI18n";

interface TermDefinitionSourceLinkProps {
    term: Term;
}

export const TermDefinitionSourceLink: React.FC<TermDefinitionSourceLinkProps> = props => {
    const defSource = props.term.definitionSource;
    const {i18n} = useI18n();
    const dispatch = useDispatch();
    const navigateToDefinitionSource = () => {
        const target = defSource!.target;
        const targetIri = VocabularyUtils.create(target.source.iri!);
        // assert target.selectors.length === 1
        dispatch(pushRoutingPayload(Routes.annotateFile, {selector: Utils.sanitizeArray(target.selectors)[0]}));
        Routing.transitionTo(Routes.annotateFile, {
            params: new Map([["name", targetIri.fragment]]),
            query: new Map([["namespace", targetIri.namespace!]])
        });
    };

    return <>
        <Button id="term-metadata-definitionSource-goto" color="primary" outline={true} size="sm" className="ml-2"
                onClick={navigateToDefinitionSource}
                title={i18n("term.metadata.definitionSource.goto.tooltip")}>
            <GoFileSymlinkFile className="mr-1"/>
            {i18n("term.metadata.definitionSource.goto")}
        </Button>
    </>;
};

export default TermDefinitionSourceLink;
